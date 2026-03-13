from app.database import engine, Base
from app.models import User, Course, Location

# 创建所有表
Base.metadata.create_all(bind=engine)
print("Database initialized successfully!")
