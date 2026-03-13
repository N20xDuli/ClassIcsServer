from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, Course as CourseSchema
from typing import List

router = APIRouter()

@router.post("/", response_model=CourseSchema)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = Course(**course.model_dump(), user_id=1)  # 暂时使用固定的 user_id=1
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.get("/", response_model=List[CourseSchema])
def get_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.user_id == 1).offset(skip).limit(limit).all()  # 暂时使用固定的 user_id=1
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseSchema)
def update_course(course_id: int, course: CourseUpdate, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    for key, value in course.model_dump(exclude_unset=True).items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id, Course.user_id == 1).first()  # 暂时使用固定的 user_id=1
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}
