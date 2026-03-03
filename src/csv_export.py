import csv
import io
from dataclasses import dataclass, asdict
from datetime import date
from typing import Iterable, Sequence


@dataclass(frozen=True)
class Worker:
    id: int
    full_name: str
    nationality: str
    residence_status: str
    company: str


@dataclass(frozen=True)
class VisaCase:
    id: int
    worker_id: int
    case_type: str
    status: str
    submitted_on: date
    expires_on: date


def _rows_to_csv(rows: Iterable[dict], fieldnames: Sequence[str]) -> str:
    """Render iterable rows as CSV text with a stable header order."""
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for row in rows:
        writer.writerow({key: row.get(key, "") for key in fieldnames})

    return output.getvalue()


def export_workers_csv(workers: Iterable[Worker]) -> str:
    """Export workers list into CSV format."""
    fieldnames = ["id", "full_name", "nationality", "residence_status", "company"]
    rows = (asdict(worker) for worker in workers)
    return _rows_to_csv(rows, fieldnames)


def export_visa_cases_csv(cases: Iterable[VisaCase]) -> str:
    """Export visa cases list into CSV format."""
    fieldnames = [
        "id",
        "worker_id",
        "case_type",
        "status",
        "submitted_on",
        "expires_on",
    ]

    rows = (
        {
            **asdict(case),
            "submitted_on": case.submitted_on.isoformat(),
            "expires_on": case.expires_on.isoformat(),
        }
        for case in cases
    )
    return _rows_to_csv(rows, fieldnames)
