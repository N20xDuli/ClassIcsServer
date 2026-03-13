from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    short_name = Column(String, unique=True, index=True)  # 简写，如 "教 A-302"
    full_name = Column(String)  # 完整名称
    address = Column(String)  # 完整地址
    latitude = Column(Float)  # 纬度
    longitude = Column(Float)  # 经度
