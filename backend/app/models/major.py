from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Major(Base):
    __tablename__ = "majors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # 专业名称，如"计算机科学与技术"
    code = Column(String, unique=True, index=True)  # 专业代码，如"CS2024"
    description = Column(String, nullable=True)  # 专业描述
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    courses = relationship("Course", back_populates="major")

    def __repr__(self):
        return f"<Major {self.name}>"
