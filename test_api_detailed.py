import sys
import json
from urllib.request import Request, urlopen
from urllib.error import HTTPError

# 设置路径
sys.path.append('backend')

url = "http://localhost:8000/api/courses"
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

# 转换为 JSON 格式
json_data = json.dumps(data).encode('utf-8')

# 创建请求
req = Request(url, data=json_data, headers={"Content-Type": "application/json"}, method="POST")

try:
    # 发送请求
    with urlopen(req) as response:
        print(f"Status code: {response.getcode()}")
        print(f"Response: {response.read().decode('utf-8')}")
except HTTPError as e:
    print(f"Error code: {e.code}")
    print(f"Error message: {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error: {e}")
