from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from app import store
from app.models import TimeEntry, TimeEntryCreate

router = APIRouter(prefix="/entries", tags=["entries"])


@router.get("/", response_model=List[TimeEntry])
async def list_time_entries() -> List[TimeEntry]:
    records = store.list_entries()
    return [
        TimeEntry(
            id=record.id,
            date=record.date,
            member_name=record.member_name,
            activity=record.activity,
            hours=record.hours,
            created_at=record.created_at,
        )
        for record in records
    ]


@router.post("/", response_model=TimeEntry, status_code=status.HTTP_201_CREATED)
async def create_time_entry(payload: TimeEntryCreate) -> TimeEntry:
    record = store.add_entry(
        date=payload.date,
        member_name=payload.member_name,
        activity=payload.activity,
        hours=payload.hours,
    )
    return TimeEntry(
        id=record.id,
        date=record.date,
        member_name=record.member_name,
        activity=record.activity,
        hours=record.hours,
        created_at=record.created_at,
    )


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(entry_id: UUID) -> None:
    deleted = store.delete_entry(entry_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "not_found",
                "message": f"Time entry with id {entry_id} does not exist",
                "detail": None,
            },
        )
