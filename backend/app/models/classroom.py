from sqlalchemy import Column, Integer, String, Boolean
from app.database import Base

class Classroom(Base):
    __tablename__ = "classrooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)  # 教室名称，如 "教 A-302"
    capacity = Column(Integer)  # 容量
    is_available = Column(Boolean, default=True)  # 是否可用
