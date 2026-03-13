import icalendar
from datetime import datetime, timedelta
from typing import List
from app.models.course import Course
from app.services.rule_engine import RuleEngine
from sqlalchemy.orm import Session

class IcsGenerator:
    """ICS 生成器"""

    @staticmethod
    def generate_ics(courses: List[Course], db: Session) -> str:
        """生成 ICS 格式的日历数据"""
        cal = icalendar.Calendar()
        cal.add('prodid', '-//ClassIcsServer//ClassIcs//CN')
        cal.add('version', '2.0')
        cal.add('calscale', 'GREGORIAN')
        cal.add('method', 'PUBLISH')

        for course in courses:
            # 计算课程的所有出现时间
            occurrences = IcsGenerator._get_course_occurrences(course, db)
            # 计算课程总次数
            total_occurrences = len(occurrences)
            for i, (start_datetime, end_datetime) in enumerate(occurrences):
                event = icalendar.Event()
                # 添加 Emoji 图标
                summary = IcsGenerator._add_emoji(course.name)
                event.add('summary', summary)
                event.add('dtstart', start_datetime)
                event.add('dtend', end_datetime)
                event.add('location', course.location)
                # 添加倒计时/进度条信息
                description = IcsGenerator._generate_description(course, i, total_occurrences)
                event.add('description', description)
                event.add('uid', f"{course.id}-{start_datetime.timestamp()}@classics-server")
                event.add('dtstamp', datetime.now())

                # 添加提醒
                reminder_time = RuleEngine.get_reminder_time(course)
                alarm = icalendar.Alarm()
                alarm.add('action', 'DISPLAY')
                alarm.add('description', f"{course.name} 即将开始")
                alarm.add('trigger', timedelta(minutes=-reminder_time))
                event.add_component(alarm)

                cal.add_component(event)

        return cal.to_ical().decode('utf-8')

    @staticmethod
    def _get_course_occurrences(course: Course, db: Session) -> List[tuple]:
        """获取课程的所有出现时间"""
        occurrences = []
        start_date = datetime.now()
        end_date = start_date + timedelta(days=180)  # 生成未来 6 个月的课程

        current_date = start_date
        while current_date <= end_date:
            # 检查是否是上课日
            if current_date.weekday() == course.day_of_week - 1:
                # 检查是否是单双周课程
                if course.is_odd_week is None or RuleEngine.is_odd_week(current_date) == course.is_odd_week:
                    start_datetime = datetime.combine(current_date.date(), course.start_time.time())
                    end_datetime = datetime.combine(current_date.date(), course.end_time.time())
                    occurrences.append((start_datetime, end_datetime))
            current_date += timedelta(days=1)

        return occurrences

    @staticmethod
    def _generate_description(course: Course, current_index: int, total_occurrences: int) -> str:
        """生成课程描述，包含倒计时/进度条信息"""
        # 计算是本学期的第几节课
        current_lesson = current_index + 1
        # 计算是本学期的倒数第几节课
        remaining_lessons = total_occurrences - current_index
        
        description = f"教师: {course.teacher}\n地点: {course.location}\n"
        description += f"这是本学期第 {current_lesson} 节课，倒数第 {remaining_lessons} 节课\n"
        
        # 计算离考试的时间（假设考试在 2025 年 1 月 15 日）
        exam_date = datetime(2025, 1, 15)
        today = datetime.now()
        days_until_exam = (exam_date - today).days
        if days_until_exam > 0:
            description += f"离考试还有 {days_until_exam} 天"
        elif days_until_exam == 0:
            description += "今天考试！"
        else:
            description += "考试已结束"
        
        return description

    @staticmethod
    def _add_emoji(course_name: str) -> str:
        """根据课程名称添加 Emoji 图标"""
        emoji_map = {
            '体育': '🏀',
            '数学': '📐',
            '编程': '💻',
            '英语': '📚',
            '物理': '⚛️',
            '化学': '🧪',
            '生物': '🧬',
            '历史': '📜',
            '地理': '🌍',
            '政治': '🏛️',
        }
        
        for key, emoji in emoji_map.items():
            if key in course_name:
                return f"{emoji} {course_name}"
        
        return course_name
