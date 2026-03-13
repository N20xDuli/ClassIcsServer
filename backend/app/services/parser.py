import json
from typing import List, Dict, Any
from datetime import datetime, timedelta

class CourseParser:
    """课程数据解析器"""

    @staticmethod
    def parse_json(json_data: str) -> List[Dict[str, Any]]:
        """解析 JSON 格式的课程数据"""
        try:
            data = json.loads(json_data)
            courses = []
            for course_item in data:
                course = {
                    "name": course_item.get("name"),
                    "teacher": course_item.get("teacher"),
                    "location": course_item.get("location"),
                    "start_time": datetime.fromisoformat(course_item.get("start_time")),
                    "end_time": datetime.fromisoformat(course_item.get("end_time")),
                    "day_of_week": course_item.get("day_of_week"),
                    "is_odd_week": course_item.get("is_odd_week"),
                    "reminder_time": course_item.get("reminder_time", 10)
                }
                courses.append(course)
            return courses
        except Exception as e:
            raise ValueError(f"解析 JSON 数据失败: {str(e)}")

    @staticmethod
    def parse_html(html_content: str) -> List[Dict[str, Any]]:
        """解析 HTML 格式的课程数据"""
        # 这里需要根据具体的教务系统 HTML 格式进行解析
        # 暂时返回一个空列表，实际实现需要根据具体情况进行调整
        return []
