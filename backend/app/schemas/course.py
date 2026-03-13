from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CourseBase(BaseModel):
    name: str
    teacher: str
    location: str
    start_time: datetime
    end_time: datetime
    day_of_week: int
    is_odd_week: Optional[bool] = None
    reminder_time: int = 10

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    name: Optional[str] = None
    teacher: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    day_of_week: Optional[int] = None
    is_odd_week: Optional[bool] = None
    reminder_time: Optional[int] = None

class Course(CourseBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
