import urllib.request
import json

try:
    with urllib.request.urlopen("http://localhost:8000/api/activities") as response:
        print(f"Status: {response.status}")
        print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
