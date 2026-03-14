import urllib.request
import json

BASE_URL = 'http://localhost:8081'

# Test GET majors
try:
    req = urllib.request.Request(f'{BASE_URL}/api/majors/')
    with urllib.request.urlopen(req) as response:
        print(f'GET /api/majors/ Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except Exception as e:
    print(f'Error GET: {e}')

# Test POST major
try:
    data = {
        'name': '人工智能',
        'code': 'AI2024',
        'description': '人工智能专业'
    }
    req = urllib.request.Request(
        f'{BASE_URL}/api/majors/',
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    with urllib.request.urlopen(req) as response:
        print(f'\nPOST /api/majors/ Status: {response.status}')
        print(f'Response: {response.read().decode()}')
except Exception as e:
    print(f'Error POST: {e}')
