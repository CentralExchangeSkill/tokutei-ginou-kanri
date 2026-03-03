import sqlite3
from datetime import date, timedelta

from app import REMINDER_DAYS, fetch_notifications, generate_visa_expiry_notifications, init_db, render_dashboard_html


def test_generates_expected_reminders():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)

    today = date(2026, 1, 1)
    rows = []
    for idx, days in enumerate(REMINDER_DAYS):
        expiry = today + timedelta(days=days)
        rows.append((f"User {idx}", expiry.isoformat()))

    rows.append(("Outside Window", (today + timedelta(days=5)).isoformat()))
    conn.executemany("INSERT INTO visa_holders(name, visa_expiry) VALUES (?, ?)", rows)
    conn.commit()

    created = generate_visa_expiry_notifications(conn, as_of=today)
    assert created == len(REMINDER_DAYS)

    reminders = fetch_notifications(conn)
    assert sorted(r["reminder_days"] for r in reminders) == sorted(REMINDER_DAYS)


def test_notification_generation_is_idempotent():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)

    today = date(2026, 1, 1)
    conn.execute(
        "INSERT INTO visa_holders(name, visa_expiry) VALUES (?, ?)",
        ("A User", (today + timedelta(days=30)).isoformat()),
    )
    conn.commit()

    first = generate_visa_expiry_notifications(conn, as_of=today)
    second = generate_visa_expiry_notifications(conn, as_of=today)

    assert first == 1
    assert second == 0
    reminders = fetch_notifications(conn)
    assert len(reminders) == 1


def test_dashboard_renders_notifications_table():
    html = render_dashboard_html([
        {"name": "User", "visa_expiry": "2026-04-01", "reminder_days": 30, "message": "Visa expires"}
    ])
    assert "Visa Expiry Notifications" in html
    assert "<table>" in html
    assert "User" in html
