"""Evidence-based historical reconciliation; proposals never approve a balance.

Only explicit --report writes a review artifact, and never inside the repo.
No database access and no execution/recalculation of Excel formulas.
"""
from __future__ import annotations

import argparse
from decimal import Decimal, localcontext, ROUND_HALF_UP
from pathlib import Path
import sys

try:
    from scripts.reconcile_openings import audit_workbook
except ModuleNotFoundError:
    from reconcile_openings import audit_workbook

D = Decimal
TOLERANCE = D("0.000001")  # Cached binary Excel noise only; never changes source values.


def close(a: Decimal, b: Decimal) -> bool:
    return abs(a - b) <= TOLERANCE


def reconcile(audit: dict) -> dict:
    with localcontext() as ctx:
        ctx.prec = 60
        summary = audit["resumen_historico_reportado"]
        capital = D(audit["capital_apertura"])
        balance = D(audit["saldo_reportado_original"])
        current = D(audit["suma_intereses_detalle"])
        earned_rows = [r for r in summary if "intereses" in r["concepto"].lower() and "ganados" in r["concepto"].lower()]
        payment_rows = [r for r in summary if any(w in r["concepto"].lower() for w in ("intereses pagados", "intereses liquidados", "intereses gastados"))]
        charge_rows = [r for r in summary if "impto" in r["concepto"].lower()]
        net_rows = [r for r in summary if any(w in r["concepto"].lower() for w in ("intereses netos", "intereses a liquidar", "intereses disponibles de liquidar"))]
        earned = D(earned_rows[0]["valor_original"]) if len(earned_rows) == 1 else None
        paid = sum((abs(D(r["valor_original"])) for r in payment_rows), D(0))
        charges = sum((abs(D(r["valor_original"])) for r in charge_rows), D(0))
        notes = []
        net = None
        basis = "pendiente"
        if not close(capital + current, balance):
            notes.append("El saldo reportado no coincide con capital más intereses del detalle; revisar caché/fórmulas.")
        elif earned is None:
            notes.append("Intereses ganados ausentes o ambiguos; no se reemplazan por cero.")
        elif len(net_rows) > 1:
            notes.append("Más de un neto informado: seleccionar la referencia correcta.")
        elif len(net_rows) == 1:
            explicit = D(net_rows[0]["valor_original"])
            if close(earned - paid - charges, explicit) and explicit >= 0:
                net = explicit
                basis = "neto explícito; aritmética comprobada"
            else:
                notes.append("El neto explícito no concilia con ganados menos pagos/cargos; no ajustar automáticamente.")
        elif paid or charges:
            if close(earned - paid, current) and not charges and earned > current:
                # E.g. gross is calculated as balance - principal + past payments.
                # Subtracting them from current interest would deduct them twice.
                net = current
                basis = "pagos ya reflejados en la diferencia entre bruto y pendiente; revisar respaldo"
                notes.append("No restar el pago nuevamente: bruto menos pago coincide con el interés del detalle.")
            elif close(earned, current):
                proposal = current - paid - charges
                if proposal < 0:
                    notes.append("Los pagos superan el interés del detalle: faltan antecedentes o el pago ya está incorporado; no importar.")
                else:
                    net = proposal
                    basis = "propuesta de descuento; falta confirmar inclusión de pagos"
            else:
                notes.append("El reporte mezcla antecedentes históricos y pagos; requiere desglose.")
        else:
            net = current
            basis = "saldo original conservado; sin pagos no nulos informados"
            notes.append("Ausencia de pagos en esta planilla no acredita que no existieron pagos históricos.")
        if earned is not None and not close(earned, current):
            notes.append("Ganados incluye importes anteriores al detalle: verificar capitalizaciones/antecedentes antes de certificar el total histórico.")
        notes.append("Ninguna propuesta está aprobada: verificar integridad del historial y vinculación del cliente.")
        proposed_balance = capital + net if net is not None else None
        if basis == "saldo original conservado; sin pagos no nulos informados":
            proposed_balance = balance
        return {
            "archivo": audit["archivo"], "capital": capital,
            "saldo_original": balance, "interes_detalle": current,
            "ganados_reportados": earned,
            "pagos_informados": paid, "cargos_informados": charges,
            "hay_pagos_informados": bool(payment_rows), "hay_cargos_informados": bool(charge_rows),
            "neto_propuesto": net,
            "saldo_neto_propuesto": proposed_balance,
            "base": basis, "observaciones": notes,
            "evidencia": summary,
            "estado_intereses_historicos": "reportado; no certificado como historial completo",
        }


def pesos(value: Decimal | None) -> str:
    if value is None:
        return "Pendiente"
    return "$" + format(value.quantize(D(1), rounding=ROUND_HALF_UP), ",.0f").replace(",", ".")


def safe_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\r", " ").replace("\n", " ")


def render(results: list[dict]) -> str:
    lines = ["# Conciliación histórica — borrador para revisión", "",
             "Corte: 30/09/2026. Inicio operativo previsto: 01/10/2026.", "",
             "No se modificaron reportes ni se cargaron datos en Supabase. Las cifras del resumen se muestran redondeadas al peso únicamente para lectura; los valores originales completos están en la evidencia. No aplicar el nuevo redondeo a cierres históricos.", "",
             "Una igualdad aritmética no certifica que el historial esté completo. Los pagos se muestran como importes positivos, conservando su signo y fórmula originales en la evidencia. Ningún saldo está aprobado automáticamente.", "",
             "| Archivo | Capital vigente | Ganados reportados | Pagos informados | Cargos | Saldo neto propuesto |",
             "|---|---:|---:|---:|---:|---:|"]
    for r in results:
        lines.append("| " + " | ".join([
            safe_cell(r["archivo"]), pesos(r["capital"]), pesos(r["ganados_reportados"]),
            pesos(r["pagos_informados"]) if r["hay_pagos_informados"] else "No informado",
            pesos(r["cargos_informados"]) if r["hay_cargos_informados"] else "No informado",
            pesos(r["saldo_neto_propuesto"]),
        ]) + " |")
    for r in results:
        lines += ["", "## " + safe_cell(r["archivo"]), "", "Criterio: " + r["base"] + ".", ""]
        lines += ["- " + note for note in r["observaciones"]]
        lines += ["", "Valores de trabajo sin redondear:", ""]
        for k in ("capital", "interes_detalle", "neto_propuesto", "saldo_neto_propuesto"):
            lines.append(f"- {k}: {r[k] if r[k] is not None else 'pendiente'}")
        lines += ["", "Evidencia del Excel (valores guardados; fórmulas no ejecutadas):", "",
                  "| Concepto | Celda | Valor original | Fórmula original |", "|---|---|---:|---|"]
        for row in r["evidencia"]:
            lines.append("| " + " | ".join(safe_cell(str(row.get(k) or "—")) for k in
                ("concepto", "celda", "valor_original", "formula_original")) + " |")
    return "\n".join(lines) + "\n"


def report_destination(path: Path) -> Path:
    destination = path.resolve()
    repository = Path(__file__).resolve().parent.parent
    if destination == repository or repository in destination.parents:
        raise ValueError("El reporte con datos de clientes debe guardarse fuera del repositorio")
    return destination


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", nargs="+", type=Path)
    parser.add_argument("--report", type=Path, help="Reporte privado opcional fuera del repositorio")
    args = parser.parse_args()
    destination = report_destination(args.report) if args.report else None
    results = [reconcile(audit_workbook(path)) for path in args.files]
    for result in results:
        print(safe_cell(result["archivo"]) + ": " + result["base"])
    if destination:
        # Exclusive creation avoids silently overwriting an earlier review artifact.
        with destination.open("x", encoding="utf-8") as handle:
            handle.write(render(results))
        print("Reporte creado fuera del repositorio: " + str(destination))
    print("Revisados: " + str(len(results)) + "; aprobados automáticamente: 0")
    return 0


if __name__ == "__main__":
    sys.exit(main())
