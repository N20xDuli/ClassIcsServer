from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.schemas.course import CourseCreate, CourseUpdate, Course as CourseSchema
from typing import List, Optional

router = APIRouter()

@router.post("/", response_model=CourseSchema)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    try:
        # 使用 model_dump(mode='python') 确保 datetime 对象保持为 datetime 类型
        db_course = Course(**course.model_dump(mode='python'), user_id=1)  # 暂时使用固定的 user_id=1
        db.add(db_course)
        db.commit()
        db.refresh(db_course)
        return db_course
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=List[CourseSchema])
def get_courses(
    skip: int = 0, 
    limit: int = 100, 
    major_id: Optional[int] = Query(None, description="按专业筛选"),
    db: Session = Depends(get_db)
):
    """获取课程列表，支持按专业筛选"""
    query = db.query(Course)
    
    # 如果指定了专业ID，则筛选该专业的课程
    if major_id is not None:
        query = query.filter(Course.major_id == major_id)
    else:
        # 否则只显示当前用户的课程
        query = query.filter(Course.user_id == 1)  # 暂时使用固定的 user_id=1
    
    courses = query.offset(skip).limit(limit).all()
    return courses

@router.get("/{course_id}", response_model=CourseSchema)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.put("/{course_id}", response_model=CourseSchema)
def update_course(course_id: int, course: CourseUpdate, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    # 使用 model_dump(mode='python', exclude_unset=True) 确保 datetime 对象保持为 datetime 类型
    for key, value in course.model_dump(mode='python', exclude_unset=True).items():
        setattr(db_course, key, value)
    db.commit()
    db.refresh(db_course)
    return db_course

@router.delete("/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(db_course)
    db.commit()
    return {"message": "Course deleted successfully"}
