import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from config import DATA_DIR

DB_FILE = DATA_DIR / "exchange.db"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS entries (
    id         TEXT PRIMARY KEY,
    type       TEXT NOT NULL,
    from_agent TEXT NOT NULL,
    to_agent   TEXT NOT NULL,
    date       TEXT NOT NULL,
    status     TEXT NOT NULL,
    content    TEXT NOT NULL,
    context    TEXT,
    created_at TEXT NOT NULL
);
"""


def _conn() -> sqlite3.Connection:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_FILE))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.executescript(_SCHEMA)


def _row_to_dict(row: sqlite3.Row) -> dict:
    d = dict(row)
    d["from"] = d.pop("from_agent")
    d["to"] = d.pop("to_agent")
    d["context"] = json.loads(d["context"]) if d.get("context") else None
    return d


def append_entry(entry: dict) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    with _conn() as conn:
        conn.execute(
            """
            INSERT INTO entries
                (id, type, from_agent, to_agent, date, status, content, context, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                entry["id"],
                entry["type"],
                entry["from"],
                entry["to"],
                entry["date"],
                entry["status"],
                entry["content"],
                json.dumps(entry["context"]) if entry.get("context") else None,
                now,
            ),
        )
    return {**entry, "created_at": now}


def get_entries(
    type_: Optional[str] = None,
    to: Optional[str] = None,
    status: Optional[str] = None,
    from_: Optional[str] = None,
) -> list[dict]:
    conditions: list[str] = []
    params: list[str] = []

    if type_:
        conditions.append("type = ?")
        params.append(type_)
    if to and to != "all":
        conditions.append("(to_agent = ? OR to_agent = 'all')")
        params.append(to)
    if status:
        conditions.append("status = ?")
        params.append(status)
    if from_:
        conditions.append("from_agent = ?")
        params.append(from_)

    where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    with _conn() as conn:
        rows = conn.execute(
            f"SELECT * FROM entries {where} ORDER BY created_at ASC", params
        ).fetchall()

    return [_row_to_dict(r) for r in rows]


def get_pending(to: str) -> list[dict]:
    return get_entries(status="pending", to=to)


def get_entry(id_: str) -> Optional[dict]:
    with _conn() as conn:
        row = conn.execute("SELECT * FROM entries WHERE id = ?", (id_,)).fetchone()
    return _row_to_dict(row) if row else None
