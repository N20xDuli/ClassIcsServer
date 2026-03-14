from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    major_id = Column(Integer, ForeignKey("majors.id"), nullable=True)  # 关联专业
    name = Column(String, index=True)
    teacher = Column(String)
    location = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    day_of_week = Column(Integer)  # 1-7，周一到周日
    is_odd_week = Column(Boolean, nullable=True)  # None 表示每周都有，True 表示单周，False 表示双周
    reminder_time = Column(Integer, default=10)  # 提前提醒时间（分钟）
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="courses")
    major = relationship("Major", back_populates="courses")
