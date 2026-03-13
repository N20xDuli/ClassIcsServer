import requests
import json

url = "http://localhost:8000/api/courses"
headers = {"Content-Type": "application/json"}
data = {
    "name": "测试课程",
    "teacher": "张老师",
    "location": "教A-302",
    "start_time": "2024-09-02T08:00:00",
    "end_time": "2024-09-02T09:40:00",
    "day_of_week": 1,
    "is_odd_week": None,
    "reminder_time": 10
}

try:
    response = requests.post(url, headers=headers, data=json.dumps(data))
    print(f"Status code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
