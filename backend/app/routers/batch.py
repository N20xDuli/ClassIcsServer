from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseUpdate
from typing import List, Optional
from datetime import datetime

router = APIRouter()

from pydantic import BaseModel

class BatchUpdateRequest(BaseModel):
    course_ids: List[int]
    name: Optional[str] = None
    teacher: Optional[str] = None
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    day_of_week: Optional[int] = None
    is_odd_week: Optional[bool] = None
    reminder_time: Optional[int] = None

class BatchDeleteRequest(BaseModel):
    course_ids: List[int]

@router.put("/courses")
def batch_update_courses(
    request: BatchUpdateRequest,
    db: Session = Depends(get_db)
):
    """批量更新课程信息"""
    updated_count = 0
    for course_id in request.course_ids:
        db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
        if db_course:
            for key, value in request.model_dump(exclude_unset=True, exclude={"course_ids"}).items():
                setattr(db_course, key, value)
            updated_count += 1
    db.commit()
    return {"updated_count": updated_count}

@router.delete("/courses")
def batch_delete_courses(
    request: BatchDeleteRequest,
    db: Session = Depends(get_db)
):
    """批量删除课程"""
    deleted_count = 0
    for course_id in request.course_ids:
        db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
        if db_course:
            db.delete(db_course)
            deleted_count += 1
    db.commit()
    return {"deleted_count": deleted_count}
