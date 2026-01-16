
import json
import sqlite3
from database import get_db_connection

def get_appointments(handler):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_appointments ORDER BY start_date, start_time")
    rows = cursor.fetchall()
    conn.close()
    
    # Convert DB rows to list of dicts
    appointments = []
    for row in rows:
        appointments.append({
            "id": row['id'],
            "title": row['title'],
            "type": row['type'],
            "start_date": row['start_date'],
            "end_date": row['end_date'],
            "start_time": row['start_time'],
            "end_time": row['end_time']
        })
    
    handler.send_json(200, appointments)

def add_appointment(handler):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data)
    
    title = data.get('title')
    type_ = data.get('type', '')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    if not all([title, start_date, end_date, start_time, end_time]):
        handler.send_error(400, "Missing required fields")
        return

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO admin_appointments (title, type, start_date, end_date, start_time, end_time)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (title, type_, start_date, end_date, start_time, end_time))
    conn.commit()
    conn.close()
    
    handler.send_json(201, {"message": "Appointment created"})

def update_appointment(handler, appointment_id):
    content_length = int(handler.headers['Content-Length'])
    post_data = handler.rfile.read(content_length)
    data = json.loads(post_data)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    fields = []
    values = []
    
    if 'title' in data:
        fields.append("title = ?")
        values.append(data['title'])
    if 'type' in data:
        fields.append("type = ?")
        values.append(data['type'])
    if 'start_date' in data:
        fields.append("start_date = ?")
        values.append(data['start_date'])
    if 'end_date' in data:
        fields.append("end_date = ?")
        values.append(data['end_date'])
    if 'start_time' in data:
        fields.append("start_time = ?")
        values.append(data['start_time'])
    if 'end_time' in data:
        fields.append("end_time = ?")
        values.append(data['end_time'])
        
    values.append(appointment_id)
    
    if fields:
        query = f"UPDATE admin_appointments SET {', '.join(fields)} WHERE id = ?"
        cursor.execute(query, tuple(values))
        conn.commit()
    
    conn.close()
    handler.send_json(200, {"message": "Appointment updated"})

def delete_appointment(handler, appointment_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM admin_appointments WHERE id = ?", (appointment_id,))
    conn.commit()
    conn.close()
    
    handler.send_json(200, {"message": "Appointment deleted"})

from router import router

router.add('GET', '/api/admin/calendar', get_appointments)
router.add('POST', '/api/admin/calendar', add_appointment)
router.add('PUT', r'/api/admin/calendar/(\d+)', update_appointment)
router.add('DELETE', r'/api/admin/calendar/(\d+)', delete_appointment)
