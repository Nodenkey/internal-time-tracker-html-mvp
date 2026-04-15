from __future__ import annotations

from datetime import date, datetime
from typing import Dict, List
from uuid import UUID, uuid4


class TimeEntryRecord:
    def __init__(
        self,
        *,
        id: UUID,
        date: date,
        member_name: str,
        activity: str,
        hours: float,
        created_at: datetime,
    ) -> None:
        self.id = id
        self.date = date
        self.member_name = member_name
        self.activity = activity
        self.hours = hours
        self.created_at = created_at


_store: Dict[UUID, TimeEntryRecord] = {}


def _seed_store() -> None:
    global _store
    if _store:
        return

    now = datetime.utcnow()
    entry1 = TimeEntryRecord(
        id=uuid4(),
        date=date(2026, 4, 14),
        member_name="Samuel Abbey",
        activity="Backend API design and implementation",
        hours=3.5,
        created_at=now,
    )
    entry2 = TimeEntryRecord(
        id=uuid4(),
        date=date(2026, 4, 15),
        member_name="Kofi Mensah",
        activity="Sprint planning and backlog refinement",
        hours=2.0,
        created_at=now,
    )
    entry3 = TimeEntryRecord(
        id=uuid4(),
        date=date(2026, 4, 15),
        member_name="Ato Toffah",
        activity="Time tracker MVP backend wiring",
        hours=4.0,
        created_at=now,
    )

    _store = {entry1.id: entry1, entry2.id: entry2, entry3.id: entry3}


_seed_store()


def list_entries() -> List[TimeEntryRecord]:
    return list(_store.values())


def add_entry(*, date: date, member_name: str, activity: str, hours: float) -> TimeEntryRecord:
    new_entry = TimeEntryRecord(
        id=uuid4(),
        date=date,
        member_name=member_name,
        activity=activity,
        hours=hours,
        created_at=datetime.utcnow(),
    )
    _store[new_entry.id] = new_entry
    return new_entry


def delete_entry(entry_id: UUID) -> bool:
    if entry_id not in _store:
        return False
    del _store[entry_id]
    return True
