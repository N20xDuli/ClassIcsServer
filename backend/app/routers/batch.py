from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseUpdate
from typing import List

router = APIRouter()

@router.put("/courses")
def batch_update_courses(
    course_ids: List[int],
    course_update: CourseUpdate,
    db: Session = Depends(get_db)
):
    """批量更新课程信息"""
    updated_count = 0
    for course_id in course_ids:
        db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
        if db_course:
            for key, value in course_update.model_dump(exclude_unset=True).items():
                setattr(db_course, key, value)
            updated_count += 1
    db.commit()
    return {"updated_count": updated_count}

@router.delete("/courses")
def batch_delete_courses(
    course_ids: List[int],
    db: Session = Depends(get_db)
):
    """批量删除课程"""
    deleted_count = 0
    for course_id in course_ids:
        db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
        if db_course:
            db.delete(db_course)
            deleted_count += 1
    db.commit()
    return {"deleted_count": deleted_count}
