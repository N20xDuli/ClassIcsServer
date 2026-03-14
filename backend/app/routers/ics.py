from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.course import Course
from app.models.major import Major
from app.services.ics_generator import IcsGenerator

router = APIRouter()

@router.get("/subscribe/{user_id}")
def get_ics_subscription(
    user_id: int, 
    major_id: Optional[int] = Query(None, description="按专业筛选课程"),
    db: Session = Depends(get_db)
):
    """获取用户的 ICS 订阅 URL，支持按专业筛选"""
    # 构建查询
    query = db.query(Course)
    
    if major_id is not None:
        # 如果指定了专业ID，则获取该专业的课程
        query = query.filter(Course.major_id == major_id)
        # 获取专业信息
        major = db.query(Major).filter(Major.id == major_id).first()
        major_name = major.name if major else f"major_{major_id}"
    else:
        # 否则获取用户的所有课程
        query = query.filter(Course.user_id == user_id)
        major_name = "all"
    
    courses = query.all()
    if not courses:
        raise HTTPException(status_code=404, detail="No courses found")

    # 生成 ICS 内容
    ics_content = IcsGenerator.generate_ics(courses, db)

    # 返回 ICS 响应
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=classics_{major_name}.ics"
        }
    )

@router.get("/majors/{major_id}/subscribe")
def get_major_ics_subscription(major_id: int, db: Session = Depends(get_db)):
    """获取专业的 ICS 订阅链接"""
    # 获取专业信息
    major = db.query(Major).filter(Major.id == major_id).first()
    if not major:
        raise HTTPException(status_code=404, detail="Major not found")
    
    # 获取该专业的所有课程
    courses = db.query(Course).filter(Course.major_id == major_id).all()
    if not courses:
        raise HTTPException(status_code=404, detail="No courses found for this major")

    # 生成 ICS 内容
    ics_content = IcsGenerator.generate_ics(courses, db)

    # 返回 ICS 响应
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=classics_{major.code}.ics"
        }
    )
