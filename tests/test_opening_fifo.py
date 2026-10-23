"""Synthetic fixtures only. Run from repository root with unittest discovery."""
from datetime import date
from decimal import Decimal as D
import unittest
import tempfile
from pathlib import Path
from zipfile import ZipFile

from scripts.reconcile_openings import Entry, opening_fifo, excel_date, audit_workbook


class OpeningFIFOTests(unittest.TestCase):
    def entry(self, ref, row, principal, rate="0.10", day=1):
        return Entry(ref, row, date(2026, 9, day), D(principal), D(rate))

    def test_withdrawal_consumes_oldest_lots_and_keeps_original_entries(self):
        entries = [self.entry("a", 1, "400"), self.entry("b", 2, "400", day=2),
                   self.entry("w", 3, "-441", day=3)]
        lots, transfers = opening_fifo(entries)
        self.assertEqual([lot.remaining for lot in lots], [D(0), D(359)])
        self.assertEqual([t.amount for t in transfers], [D(400), D(41)])
        self.assertEqual(entries[0].principal, D(400))

    def test_rate_stays_with_each_source_not_with_withdrawal(self):
        entries = [self.entry("a", 1, "100", "0.1001"),
                   self.entry("b", 2, "200", "0.0761", day=2),
                   self.entry("w", 3, "-150", "0.1001", day=3)]
        lots, _ = opening_fifo(entries)
        self.assertEqual(lots[1].remaining, D(150))
        self.assertEqual(lots[1].entry.rate, D("0.0761"))

    def test_historical_decimals_are_preserved_exactly(self):
        lots, _ = opening_fifo([self.entry("a", 1, "100.5586339701"),
                               self.entry("w", 2, "-1.1234567891", day=2)])
        self.assertEqual(lots[0].remaining, D("99.4351771810"))

    def test_same_day_uses_source_row_order_and_repeated_withdrawals(self):
        entries = [self.entry("w2", 4, "-40"), self.entry("b", 2, "50"),
                   self.entry("a", 1, "100"), self.entry("w1", 3, "-90")]
        lots, _ = opening_fifo(entries)
        self.assertEqual([lot.remaining for lot in lots], [D(0), D(20)])

    def test_cannot_consume_a_future_deposit(self):
        with self.assertRaisesRegex(ValueError, "sin capital"):
            opening_fifo([self.entry("w", 1, "-100"), self.entry("a", 2, "200", day=2)])

    def test_post_cutoff_and_duplicate_events_are_rejected(self):
        with self.assertRaises(ValueError):
            opening_fifo([Entry("future", 1, date(2026, 10, 1), D(100), D(".1"))])
        with self.assertRaises(ValueError):
            opening_fifo([self.entry("a", 1, "100"), self.entry("a", 2, "100")])

    def test_excel_calendar(self):
        self.assertEqual(excel_date("46295", False), date(2026, 9, 30))
        self.assertEqual(excel_date("0", True), date(1904, 1, 1))
        with self.assertRaises(ValueError):
            excel_date("46295.5", False)

    def test_workbook_keeps_original_total_and_flags_historical_notes(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic.xlsx"
            with ZipFile(path, "w") as archive:
                archive.writestr("xl/workbook.xml", '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" r:id="r1"/></sheets></workbook>')
                archive.writestr("xl/_rels/workbook.xml.rels", '<Relationships><Relationship Id="r1" Target="worksheets/sheet1.xml"/></Relationships>')
                archive.writestr("xl/worksheets/sheet1.xml", '''<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>
                  <row><c r="H5"><v>46295</v></c></row>
                  <row><c r="C18" t="inlineStr"><is><t>Inversión</t></is></c><c r="D18" t="inlineStr"><is><t>Tasa anual</t></is></c></row>
                  <row><c r="C19" t="inlineStr"><is><t>ant.</t></is></c></row>
                  <row><c r="C20"><v>100.123456789</v></c><c r="D20"><v>0.0761</v></c><c r="E20"><v>46200</v></c><c r="G20"><v>5.864197532</v></c></row>
                  <row><c r="E25" t="inlineStr"><is><t>Total acumulado</t></is></c><c r="H25"><v>105.987654321</v></c></row>
                  </sheetData></worksheet>''')
            result = audit_workbook(path)
            self.assertEqual(result["capital_apertura"], "100.123456789")
            self.assertEqual(result["saldo_reportado_original"], "105.987654321")
            self.assertIn("pendiente", result["estado_intereses_historicos"])
            self.assertEqual(len(result["observaciones"]), 2)


if __name__ == "__main__":
    unittest.main()
