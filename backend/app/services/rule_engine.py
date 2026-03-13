from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.models.location import Location
from sqlalchemy.orm import Session

class RuleEngine:
    """智能规则引擎"""

    @staticmethod
    def calculate_week_number(date: datetime) -> int:
        """计算日期所在的周数"""
        # 假设第一周从 2024 年 9 月 2 日（周一）开始
        start_date = datetime(2024, 9, 2)
        delta = date - start_date
        weeks = delta.days // 7 + 1
        return weeks

    @staticmethod
    def is_odd_week(date: datetime) -> bool:
        """判断日期是否在单周"""
        week_number = RuleEngine.calculate_week_number(date)
        return week_number % 2 == 1

    @staticmethod
    def get_next_occurrence(course: Any, db: Session) -> Optional[datetime]:
        """计算课程的下一次出现时间"""
        today = datetime.now().date()
        current_time = datetime.now().time()

        # 计算下一个上课日
        days_until_next = (course.day_of_week - today.weekday() - 1) % 7 + 1
        next_date = today + timedelta(days=days_until_next)

        # 检查是否是单双周课程
        if course.is_odd_week is not None:
            while RuleEngine.is_odd_week(next_date) != course.is_odd_week:
                next_date += timedelta(days=7)

        # 组合日期和时间
        start_datetime = datetime.combine(next_date, course.start_time.time())

        # 如果今天就是上课日且时间未过，返回今天的课程时间
        if today.weekday() == course.day_of_week - 1:
            if current_time < course.start_time.time():
                start_datetime = datetime.combine(today, course.start_time.time())

        return start_datetime

    @staticmethod
    def map_location(short_name: str, db: Session) -> Dict[str, Any]:
        """映射上课地点"""
        location = db.query(Location).filter(Location.short_name == short_name).first()
        if location:
            return {
                "short_name": location.short_name,
                "full_name": location.full_name,
                "address": location.address,
                "latitude": location.latitude,
                "longitude": location.longitude
            }
        else:
            # 如果没有找到映射，返回原始名称
            return {
                "short_name": short_name,
                "full_name": short_name,
                "address": short_name,
                "latitude": None,
                "longitude": None
            }

    @staticmethod
    def get_reminder_time(course: Any) -> int:
        """根据课程类型获取提醒时间"""
        # 这里可以根据课程名称或其他属性设置不同的提醒时间
        # 例如：早八课程提前 40 分钟，普通课程提前 10 分钟
        if course.start_time.hour == 8:
            return 40
        else:
            return course.reminder_time
