import sys
sys.path.append('backend')
from app.database import engine, SessionLocal, Base
from app.models import User, Course

# 创建会话
db = SessionLocal()

try:
    # 检查是否存在用户，如果不存在则创建一个
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(username="test", email="test@example.com", password_hash="test")
        db.add(user)
        db.commit()
        print("User created successfully!")
    else:
        print("User already exists!")
    
    # 尝试创建课程
    course = Course(
        user_id=1,
        name="测试课程",
        teacher="张老师",
        location="教A-302",
        start_time="2024-09-02T08:00:00",
        end_time="2024-09-02T09:40:00",
        day_of_week=1,
        is_odd_week=None,
        reminder_time=10
    )
    db.add(course)
    db.commit()
    print("Course created successfully!")
except Exception as e:
    print(f"Error: {e}")
finally:
    db.close()
