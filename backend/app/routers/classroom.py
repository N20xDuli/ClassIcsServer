from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.classroom import Classroom
from app.models.course import Course
from datetime import datetime, time
from typing import List

router = APIRouter()

@router.get("/available")
def get_available_classrooms(
    day_of_week: int = Query(..., description="星期几，1-7"),
    start_time: str = Query(..., description="开始时间，格式：HH:MM"),
    end_time: str = Query(..., description="结束时间，格式：HH:MM"),
    db: Session = Depends(get_db)
):
    """查询特定时间段的空教室"""
    # 解析时间
    start_hour, start_minute = map(int, start_time.split(":"))
    end_hour, end_minute = map(int, end_time.split(":"))
    start_time_obj = time(start_hour, start_minute)
    end_time_obj = time(end_hour, end_minute)

    # 查询所有可用的教室
    all_classrooms = db.query(Classroom).filter(Classroom.is_available == True).all()

    # 查询该时间段有课程的教室
    occupied_classrooms = db.query(Course.location).filter(
        Course.day_of_week == day_of_week,
        Course.start_time.time() < end_time_obj,
        Course.end_time.time() > start_time_obj
    ).all()
    occupied_locations = [loc[0] for loc in occupied_classrooms]

    # 计算空教室
    available_classrooms = [classroom for classroom in all_classrooms if classroom.name not in occupied_locations]

    return {"available_classrooms": [classroom.name for classroom in available_classrooms]}
