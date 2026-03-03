from __future__ import annotations

from datetime import date, datetime
import html
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).with_name("app.db")
REMINDER_DAYS = (90, 60, 30, 14, 7)


def open_db(db_path: Path | str = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS visa_holders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            visa_expiry DATE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visa_holder_id INTEGER NOT NULL,
            reminder_days INTEGER NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE(visa_holder_id, reminder_days),
            FOREIGN KEY(visa_holder_id) REFERENCES visa_holders(id)
        );
        """
    )
    conn.commit()


def generate_visa_expiry_notifications(conn: sqlite3.Connection, as_of: date | None = None) -> int:
    today = as_of or date.today()
    visa_rows = conn.execute("SELECT id, name, visa_expiry FROM visa_holders").fetchall()
    created = 0

    for row in visa_rows:
        expiry = datetime.strptime(row["visa_expiry"], "%Y-%m-%d").date()
        days_left = (expiry - today).days

        if days_left in REMINDER_DAYS:
            message = (
                f"{row['name']}'s visa expires in {days_left} days "
                f"on {expiry.isoformat()}."
            )
            result = conn.execute(
                """
                INSERT OR IGNORE INTO notifications(
                    visa_holder_id, reminder_days, message, created_at
                ) VALUES (?, ?, ?, ?)
                """,
                (row["id"], days_left, message, datetime.utcnow().isoformat()),
            )
            if result.rowcount:
                created += 1

    conn.commit()
    return created


def fetch_notifications(conn: sqlite3.Connection) -> list[dict]:
    rows = conn.execute(
        """
        SELECT n.id, v.name, v.visa_expiry, n.reminder_days, n.message, n.created_at
        FROM notifications n
        JOIN visa_holders v ON v.id = n.visa_holder_id
        ORDER BY n.reminder_days ASC, v.name ASC
        """
    ).fetchall()
    return [dict(row) for row in rows]


def render_dashboard_html(reminders: list[dict]) -> str:
    if not reminders:
        rows = "<p>No notifications yet.</p>"
    else:
        body = "".join(
            "<tr>"
            f"<td>{html.escape(r['name'])}</td>"
            f"<td>{html.escape(r['visa_expiry'])}</td>"
            f"<td>{r['reminder_days']}</td>"
            f"<td>{html.escape(r['message'])}</td>"
            "</tr>"
            for r in reminders
        )
        rows = (
            "<table><thead><tr><th>Name</th><th>Expiry Date</th><th>Reminder (days)</th><th>Message</th></tr>"
            f"</thead><tbody>{body}</tbody></table>"
        )

    return (
        "<!doctype html><html><head><meta charset='utf-8'><title>Visa Dashboard</title></head><body>"
        "<h1>Visa Expiry Notifications</h1>"
        f"{rows}</body></html>"
    )


if __name__ == "__main__":
    conn = open_db()
    init_db(conn)
    generate_visa_expiry_notifications(conn)
    html_output = render_dashboard_html(fetch_notifications(conn))
    Path("dashboard.html").write_text(html_output, encoding="utf-8")
    conn.close()
