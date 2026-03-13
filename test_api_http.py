import http.client
import json

# 创建连接
conn = http.client.HTTPConnection("localhost", 8000)

# 准备数据
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
json_data = json.dumps(data)

# 发送请求
headers = {"Content-Type": "application/json"}
conn.request("POST", "/api/courses/", json_data, headers)

# 获取响应
response = conn.getresponse()

# 打印响应信息
print(f"Status: {response.status} {response.reason}")
print(f"Headers: {dict(response.getheaders())}")
print(f"Body: {response.read().decode('utf-8')}")

# 关闭连接
conn.close()
