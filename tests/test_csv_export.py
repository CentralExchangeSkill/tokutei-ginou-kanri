from datetime import date

from src.csv_export import (
    VisaCase,
    Worker,
    export_visa_cases_csv,
    export_workers_csv,
)


def test_export_workers_csv():
    workers = [
        Worker(
            id=1,
            full_name="Nguyen Van A",
            nationality="Vietnam",
            residence_status="Specified Skilled Worker",
            company="Tokyo Foods",
        ),
        Worker(
            id=2,
            full_name="Siti Rahma",
            nationality="Indonesia",
            residence_status="Specified Skilled Worker",
            company="Osaka Care",
        ),
    ]

    actual = export_workers_csv(workers)

    assert actual == (
        "id,full_name,nationality,residence_status,company\r\n"
        "1,Nguyen Van A,Vietnam,Specified Skilled Worker,Tokyo Foods\r\n"
        "2,Siti Rahma,Indonesia,Specified Skilled Worker,Osaka Care\r\n"
    )


def test_export_visa_cases_csv():
    cases = [
        VisaCase(
            id=10,
            worker_id=1,
            case_type="Change of Status",
            status="Submitted",
            submitted_on=date(2026, 1, 10),
            expires_on=date(2026, 3, 31),
        )
    ]

    actual = export_visa_cases_csv(cases)

    assert actual == (
        "id,worker_id,case_type,status,submitted_on,expires_on\r\n"
        "10,1,Change of Status,Submitted,2026-01-10,2026-03-31\r\n"
    )
