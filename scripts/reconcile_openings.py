"""Read-only Excel audit. Never writes client data, SQL, or database records.

The FIFO distribution is an opening proposal, not a rewrite of past statements.
Uses only Python's standard library; not part of the website runtime.
"""
from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal, InvalidOperation, localcontext
import json
from pathlib import Path, PurePosixPath
import re
import xml.etree.ElementTree as ET
from zipfile import ZipFile

NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"
CUTOFF = date(2026, 9, 30)


@dataclass(frozen=True)
class Entry:
    reference: str
    row: int
    start: date
    principal: Decimal
    rate: Decimal


@dataclass(frozen=True)
class Lot:
    entry: Entry
    remaining: Decimal


@dataclass(frozen=True)
class Allocation:
    withdrawal: str
    source: str
    amount: Decimal
    withdrawal_date: date


def opening_fifo(entries: list[Entry], cutoff: date = CUTOFF) -> tuple[list[Lot], list[Allocation]]:
    """Exact principal allocation only. No recalculation of historical interest.

    Same-date events follow original worksheet order (row number). An importer
    must confirm that order when time-of-day information is unavailable.
    """
    with localcontext() as ctx:
        ctx.prec = 60
        if len({e.reference for e in entries}) != len(entries):
            raise ValueError("Referencias duplicadas")
        if len({e.row for e in entries}) != len(entries):
            raise ValueError("Orden de filas ambiguo")
        remaining: list[Lot] = []
        allocations = []
        for entry in sorted(entries, key=lambda e: (e.start, e.row)):
            if (not entry.principal.is_finite() or not entry.rate.is_finite()
                    or entry.principal == 0 or entry.rate < 0):
                raise ValueError("Capital o tasa inválidos")
            if entry.start > cutoff:
                raise ValueError("Hay movimientos posteriores al corte solicitado")
            if entry.principal > 0:
                remaining.append(Lot(entry, entry.principal))
                continue
            pending = -entry.principal
            for index, lot in enumerate(remaining):
                if pending == 0:
                    break
                take = min(pending, lot.remaining)
                if take == 0:
                    continue
                allocations.append(Allocation(entry.reference, lot.entry.reference, take, entry.start))
                remaining[index] = Lot(lot.entry, lot.remaining - take)
                pending -= take
            if pending:
                raise ValueError(f"Retiro sin capital suficiente en {entry.reference}")
        if sum((lot.remaining for lot in remaining), Decimal(0)) != sum(
                (entry.principal for entry in entries), Decimal(0)):
            raise ValueError("El capital de apertura no concilia")
        return remaining, allocations


def decimal_value(value: str | None) -> Decimal | None:
    try:
        result = Decimal(value) if value is not None else None
        return result if result is not None and result.is_finite() else None
    except InvalidOperation:
        return None


def excel_date(value: str, system_1904: bool) -> date:
    serial = Decimal(value)
    if not serial.is_finite() or serial != serial.to_integral_value():
        raise ValueError("Fecha Excel inválida o con hora: revisar manualmente")
    if not system_1904 and serial < 61:
        raise ValueError("Fecha Excel antigua fuera del alcance")
    return (date(1904, 1, 1) if system_1904 else date(1899, 12, 30)) + timedelta(days=int(serial))


def read_workbook(path: Path, *, formulas: dict[str, str] | None = None) -> tuple[list[dict[str, str]], bool]:
    with ZipFile(path) as archive:
        strings: list[str] = []
        if "xl/sharedStrings.xml" in archive.namelist():
            strings = ["".join(node.itertext()) for node in
                       ET.fromstring(archive.read("xl/sharedStrings.xml")).findall("m:si", NS)]
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        properties = workbook.find("m:workbookPr", NS)
        system_1904 = properties is not None and properties.get("date1904") in ("1", "true")
        relations = {node.get("Id"): node for node in
                     ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))}
        sheets = []
        for sheet in workbook.findall("m:sheets/m:sheet", NS):
            relation = relations[sheet.attrib[REL_ID]]
            if relation.get("TargetMode") == "External":
                raise ValueError("No se admiten hojas externas")
            target = relation.attrib["Target"]
            target = target.lstrip("/") if target.startswith("/") else "xl/" + target
            if ".." in PurePosixPath(target).parts or not target.startswith("xl/"):
                raise ValueError("Ruta de hoja inválida")
            cells = {}
            for cell in ET.fromstring(archive.read(target)).findall("m:sheetData/m:row/m:c", NS):
                formula = cell.find("m:f", NS)
                if formulas is not None and formula is not None and formula.text:
                    formulas[cell.attrib["r"]] = formula.text
                value = cell.find("m:v", NS)
                text = value.text if value is not None else None
                if cell.get("t") == "s" and text is not None:
                    text = strings[int(text)]
                elif cell.get("t") == "inlineStr":
                    inline = cell.find("m:is", NS)
                    text = "".join(inline.itertext()) if inline is not None else None
                if text is not None:
                    cells[cell.attrib["r"]] = text
            sheets.append(cells)
        return sheets, system_1904


def audit_workbook(path: Path, cutoff: date = CUTOFF) -> dict:
    formulas: dict[str, str] = {}
    sheets, system_1904 = read_workbook(path, formulas=formulas)
    if len(sheets) != 1:
        raise ValueError("Más de una hoja: requiere seleccionar y conciliar manualmente")
    cells = sheets[0]
    if "H5" not in cells or excel_date(cells["H5"], system_1904) != cutoff:
        raise ValueError("Fecha de corte ausente o diferente de la apertura")
    # Only the supplied report template is accepted; never guess column mappings.
    header = next((int(ref[1:]) for ref, value in cells.items()
                   if ref.startswith("C") and value.strip().lower() == "inversión"), None)
    if header is None or cells.get(f"D{header}", "").strip().lower() != "tasa anual":
        raise ValueError("Formato de columnas no reconocido")
    total_rows = [int(ref[1:]) for ref, value in cells.items()
                  if re.fullmatch(r"E\d+", ref) and value.strip().lower() == "total acumulado"]
    if len(total_rows) != 1 or total_rows[0] <= header:
        raise ValueError("Total acumulado ausente o ambiguo")
    end = total_rows[0]
    entries = []
    warnings = []
    for row in range(header + 1, end):
        value = cells.get(f"C{row}")
        if value is None:
            continue
        principal = decimal_value(value)
        rate = decimal_value(cells.get(f"D{row}"))
        if value.strip().lower() == "ant." and rate is None:
            warnings.append(f"Fila {row}: antecedentes históricos fuera del detalle; conciliar por separado")
            continue
        if principal is None or rate is None:
            raise ValueError(f"Capital o tasa no numéricos en fila {row}")
        if principal == 0:
            warnings.append(f"Fila {row} con capital cero; omitida")
            continue
        start = excel_date(cells[f"E{row}"], system_1904)
        # Excel binary artifacts are NOT changed; rate normalization requires
        # separate review before any future import into PostgreSQL.
        entries.append(Entry(f"C{row}", row, start, principal, rate))
    if not entries:
        raise ValueError("Sin movimientos reconocidos")
    lots, allocations = opening_fifo(entries, cutoff)
    with localcontext() as ctx:
        ctx.prec = 60
        current = sum((lot.remaining for lot in lots), Decimal(0))
        positive = sum((entry.principal for entry in entries if entry.principal > 0), Decimal(0))
        withdrawals = -sum((entry.principal for entry in entries if entry.principal < 0), Decimal(0))
        detail_interest = Decimal(0)
        for entry in entries:
            interest = decimal_value(cells.get(f"G{entry.row}"))
            if interest is None:
                raise ValueError(f"Interés guardado ausente o inválido en G{entry.row}")
            detail_interest += interest
        rates_changed = sum(1 for allocation in allocations if
                            abs(next(e.rate for e in entries if e.reference == allocation.withdrawal)
                                - next(e.rate for e in entries if e.reference == allocation.source)) > Decimal("0.0000000001"))
    payments = [ref for ref, value in cells.items()
                if re.fullmatch(r"E\d+", ref) and any(word in value.lower()
                    for word in ("pagados", "liquidados", "gastados", "impto"))]
    earned = [ref for ref, value in cells.items()
              if re.fullmatch(r"E\d+", ref) and "intereses" in value.lower() and "ganados" in value.lower()]
    if any(e.principal != e.principal.to_integral_value() for e in entries):
        warnings.append("Capitales con decimales históricos: conservar sin redondear")
    if payments:
        warnings.append("Pagos/cargos históricos: conciliar signo e inclusión en saldo neto")
    if rates_changed:
        warnings.append("FIFO cruza tasas distintas: conservar interés histórico y revisar apertura")
    if any(sum(1 for e in entries if e.start == w.start) > 1 for w in entries if w.principal < 0):
        warnings.append("Aportes/retiros en el mismo día: orden propuesto según filas del Excel")
    return {
        "archivo": path.name, "corte": cutoff.isoformat(),
        "filas": len(entries), "retiros": sum(e.principal < 0 for e in entries),
        "lotes_con_saldo": sum(lot.remaining > 0 for lot in lots),
        "tramos_fifo": len(allocations),
        "capital_positivo_original": str(positive), "capital_retirado": str(withdrawals),
        "capital_apertura": str(current), "diferencia_capital": "0",
        "suma_intereses_detalle": str(detail_interest),
        "saldo_reportado_original": cells.get(f"H{end}"),
        "intereses_ganados_reportados": [cells.get("H" + ref[1:]) for ref in earned],
        "resumen_historico_reportado": [
            {"concepto": label, "celda": "H" + ref[1:], "valor_original": cells["H" + ref[1:]],
             "formula_original": formulas.get("H" + ref[1:])}
            for ref, label in cells.items()
            if re.fullmatch(r"E\d+", ref) and int(ref[1:]) >= end
            and decimal_value(cells.get("H" + ref[1:])) is not None
        ],
        "estado_intereses_historicos": "pendiente de conciliación; no recalculado",
        "estado_apertura": "propuesta; no importada ni aprobada",
        "observaciones": warnings,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("files", type=Path, nargs="+", help="Archivos XLSX explícitos, solo lectura")
    args = parser.parse_args()
    failures = 0
    for path in args.files:
        try:
            result = audit_workbook(path)
        except (ValueError, KeyError, OSError, InvalidOperation) as error:
            result = {"archivo": path.name, "error": str(error)}
            failures += 1
        print(json.dumps(result, ensure_ascii=True))
    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
