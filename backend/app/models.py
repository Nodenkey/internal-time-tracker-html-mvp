from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class TimeEntryBase(BaseModel):
    date: date = Field(..., description="Entry date in ISO format (YYYY-MM-DD)")
    member_name: str = Field(..., min_length=1, max_length=100)
    activity: str = Field(..., min_length=1, max_length=200)
    hours: float = Field(..., description="Number of hours spent on the activity")

    @field_validator("member_name", "activity")
    @classmethod
    def non_blank_strings(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be blank")
        return v

    @field_validator("hours")
    @classmethod
    def validate_hours(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("hours must be greater than 0")
        if v > 24:
            raise ValueError("hours must not exceed 24 in a single entry")
        return v


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntry(TimeEntryBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
