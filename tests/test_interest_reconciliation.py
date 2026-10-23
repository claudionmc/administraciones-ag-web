"""No real client data: assertions cover double payments and uncertain history."""
from decimal import Decimal as D
from pathlib import Path
import unittest

from scripts.reconcile_interest import reconcile, render, report_destination


def row(label, value, cell="H30", formula=None):
    return {"concepto": label, "valor_original": str(value), "celda": cell, "formula_original": formula}


def audit(earned, current, extras=None):
    summary = [] if earned is None else [row("Intereses ganados", earned)]
    return {"archivo": "synthetic.xlsx", "capital_apertura": "10000.123",
            "saldo_reportado_original": str(D("10000.123") + D(current)),
            "suma_intereses_detalle": str(current),
            "resumen_historico_reportado": summary + (extras or [])}


class HistoricalInterestTests(unittest.TestCase):
    def test_explicit_net_subtracts_positive_payment_once(self):
        result = reconcile(audit("1000.5", "1000.5", [
            row("Intereses liquidados", "200"), row("Intereses a liquidar", "800.5")]))
        self.assertEqual(result["saldo_neto_propuesto"], D("10800.623"))
        self.assertEqual(result["saldo_original"], D("11000.623"))

    def test_negative_payment_is_outflow_and_tax_is_separate(self):
        result = reconcile(audit("1000", "1000", [row("Intereses liquidados", "-200"),
            row("Pago cuota impto", "-10"), row("Intereses netos", "790")]))
        self.assertEqual(result["neto_propuesto"], D(790))
        self.assertEqual(result["cargos_informados"], D(10))

    def test_gross_already_includes_past_payments_no_second_deduction(self):
        result = reconcile(audit("1500", "1000", [row("Intereses pagados", "-500")]))
        self.assertEqual(result["neto_propuesto"], D(1000))
        self.assertIn("ya reflejados", result["base"])

    def test_payment_greater_than_detail_requires_review(self):
        result = reconcile(audit("100", "100", [row("Intereses pagados", "-500")]))
        self.assertIsNone(result["neto_propuesto"])
        self.assertIsNone(result["saldo_neto_propuesto"])
        self.assertIn("no importar", " ".join(result["observaciones"]))

    def test_capitalized_history_kept_separate_from_current(self):
        result = reconcile(audit("1500", "100"))
        self.assertEqual(result["ganados_reportados"], D(1500))
        self.assertEqual(result["neto_propuesto"], D(100))
        self.assertIn("verificar capitalizaciones", " ".join(result["observaciones"]))

    def test_conflicting_explicit_net_and_missing_gross_fail_closed(self):
        self.assertIsNone(reconcile(audit(None, "100"))["saldo_neto_propuesto"])
        result = reconcile(audit("1000", "1000", [row("Intereses pagados", "-200"), row("Intereses netos", "900")]))
        self.assertIsNone(result["saldo_neto_propuesto"])

    def test_zero_payment_does_not_change_balance_and_report_preserves_decimals(self):
        result = reconcile(audit("100.987654321", "100.987654321", [row("Intereses pagados", "0")]))
        self.assertEqual(result["saldo_neto_propuesto"], result["saldo_original"])
        self.assertIn("100.987654321", render([result]))
        self.assertIn("Ningún saldo está aprobado", render([result]))

    def test_report_cannot_be_written_to_repository(self):
        with self.assertRaises(ValueError):
            report_destination(Path(__file__).resolve().parent / "clients.md")

    def test_cache_noise_never_rewrites_original_balance_and_missing_is_not_zero(self):
        source = audit("100", "100")
        source["saldo_reportado_original"] = "10100.123000001"
        result = reconcile(source)
        self.assertEqual(result["saldo_neto_propuesto"], D("10100.123000001"))
        self.assertFalse(result["hay_pagos_informados"])
        self.assertIn("No informado", render([result]))


if __name__ == "__main__":
    unittest.main()
