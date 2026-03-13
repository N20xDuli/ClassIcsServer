from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.course import Course
from app.services.ics_generator import IcsGenerator

router = APIRouter()

@router.get("/subscribe/{user_id}")
def get_ics_subscription(user_id: int, db: Session = Depends(get_db)):
    """获取用户的 ICS 订阅 URL"""
    # 获取用户的所有课程
    courses = db.query(Course).filter(Course.user_id == user_id).all()
    if not courses:
        raise HTTPException(status_code=404, detail="No courses found for this user")

    # 生成 ICS 内容
    ics_content = IcsGenerator.generate_ics(courses, db)

    # 返回 ICS 响应
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={
            "Content-Disposition": f"attachment; filename=classics_user_{user_id}.ics"
        }
    )
