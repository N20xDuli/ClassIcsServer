import urllib.request
import json

# Test GET majors
try:
    req = urllib.request.Request('http://localhost:8000/api/majors/')
    with urllib.request.urlopen(req) as response:
        print(f'GET /api/majors/ Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except Exception as e:
    print(f'Error GET: {e}')

# Test POST major
try:
    data = {
        'name': '计算机科学与技术',
        'code': 'CS2024',
        'description': '计算机专业'
    }
    req = urllib.request.Request(
        'http://localhost:8000/api/majors/',
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as response:
        print(f'\nPOST /api/majors/ Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except Exception as e:
    print(f'Error POST: {e}')
