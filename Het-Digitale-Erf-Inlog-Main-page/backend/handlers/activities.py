from database import get_db_connection
from router import router

def get_activities(request):
    conn = get_db_connection()
    activities = conn.execute("SELECT * FROM activities").fetchall()
    conn.close()
    result = [dict(row) for row in activities]
    return request.send_json(200, result)

def create_activity(request):
    data = request.get_json_body()
    required = ['name', 'date', 'time', 'location', 'max_participants']
    if not all(k in data for k in required):
        return request.send_json(400, {'error': 'Missing required fields'})

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO activities (name, description, date, time, location, current_participants, max_participants) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                data['name'], 
                data.get('description'), 
                data['date'], 
                data['time'], 
                data['location'],
                data.get('current_participants', 0),
                data['max_participants']
            )
        )
        conn.commit()
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return request.send_json(201, {'id': new_id, 'message': 'Activity created'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def update_activity(request, activity_id):
    data = request.get_json_body()
    conn = get_db_connection()
    fields = []
    values = []
    
    allowed_fields = ['name', 'description', 'date', 'time', 'location', 'current_participants', 'max_participants']
    
    for key in allowed_fields:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
            
    if not fields:
         conn.close()
         return request.send_json(400, {'error': 'No fields to update'})
         
    values.append(activity_id)
    try:
        conn.execute(f"UPDATE activities SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        return request.send_json(200, {'message': 'Activity updated'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def delete_activity(request, activity_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM activities WHERE id = ?", (activity_id,))
    conn.commit()
    conn.close()
    return request.send_json(200, {'message': 'Activity deleted'})

# Register Routes
router.add('GET', '/api/activities', get_activities)
router.add('POST', '/api/activities', create_activity)
router.add('PUT', '/api/activities/(\d+)', update_activity)
router.add('DELETE', '/api/activities/(\d+)', delete_activity)
