import json
import uuid
import sqlite3
from database import get_db_connection, hash_password
from router import router

def login(request):
    data = request.get_json_body()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return request.send_json(400, {'error': 'Username and password required'})

    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = hash_password(password)
    cursor.execute("SELECT id, role FROM users WHERE username = ? AND password_hash = ?", (username, password_hash))
    user = cursor.fetchone()

    if user:
        token = str(uuid.uuid4())
        cursor.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user['id']))
        conn.commit()
        conn.close()
        
        return request.send_json(200, {
            'token': token,
            'user': {
                'username': username,
                'role': user['role']
            }
        })
    else:
        conn.close()
        return request.send_json(401, {'error': 'Invalid credentials'})

def logout(request):
    token = request.headers.get('Authorization')
    if token:
        # Bearer token handling
        if token.startswith('Bearer '):
            token = token.split(' ')[1]
            
        conn = get_db_connection()
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
        conn.close()
        
    return request.send_json(200, {'message': 'Logged out successfully'})

# Register Routes
router.add('POST', '/api/auth/login', login)
router.add('POST', '/api/auth/logout', logout)
