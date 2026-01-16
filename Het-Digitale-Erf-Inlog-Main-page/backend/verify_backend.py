import urllib.request
import urllib.parse
import json
import time
import sys

BASE_URL = "http://localhost:8000/api"

def request(method, endpoint, data=None, token=None):
    url = BASE_URL + endpoint
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    
    if data:
        data_bytes = json.dumps(data).encode('utf-8')
    else:
        data_bytes = None
    
    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, body
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("Waiting for server to start...")
    time.sleep(2)
    
    print("\n--- Testing Auth ---")
    status, res = request('POST', '/auth/login', {'username': 'admin', 'password': 'admin123'})
    print(f"Login: {status}")
    if status != 200:
        print("Login failed, aborting.")
        return
    token = res['token']
    print(f"Token acquired: {token[:10]}...")

    print("\n--- Testing Occupancy ---")
    status, res = request('GET', '/occupancy', token=token)
    print(f"Get Occupancy: {status}, Count: {len(res) if isinstance(res, list) else res}")

    print("\n--- Testing Reservations ---")
    status, res = request('POST', '/reservations', {
        'date': '2025-07-20',
        'name': 'Test Camper',
        'pitch_number': 5,
        'guest_count': 3
    }, token=token)
    print(f"Create Reservation: {status}, {res}")
    
    status, res = request('GET', '/reservations', token=token)
    print(f"Get Reservations: {status}, Count: {len(res) if isinstance(res, list) else res}")

    print("\n--- Testing Tasks ---")
    status, res = request('POST', '/tasks', {
        'title': 'Fix leaky tap',
        'priority': 'high'
    }, token=token)
    print(f"Create Task: {status}, {res}")

    print("\nTests Complete.")

if __name__ == '__main__':
    run_tests()
