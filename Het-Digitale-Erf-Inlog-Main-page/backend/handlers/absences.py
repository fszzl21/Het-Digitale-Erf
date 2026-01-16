from database import get_db_connection
from router import router

def get_absences(request):
    conn = get_db_connection()
    absences = conn.execute("SELECT * FROM absences").fetchall()
    conn.close()
    result = [dict(row) for row in absences]
    return request.send_json(200, result)

def create_absence(request):
    data = request.get_json_body()
    required = ['employee', 'type', 'start_date']
    if not all(k in data for k in required):
        return request.send_json(400, {'error': 'Missing required fields'})

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO absences (employee, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?)",
            (data['employee'], data['type'], data['start_date'], data.get('end_date'), data.get('reason'))
        )
        conn.commit()
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return request.send_json(201, {'id': new_id, 'message': 'Absence registered'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def update_absence(request, absence_id):
    data = request.get_json_body()
    conn = get_db_connection()
    fields = []
    values = []
    
    for key in ['employee', 'type', 'start_date', 'end_date', 'reason']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
            
    if not fields:
         conn.close()
         return request.send_json(400, {'error': 'No fields to update'})
         
    values.append(absence_id)
    try:
        conn.execute(f"UPDATE absences SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        return request.send_json(200, {'message': 'Absence updated'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def delete_absence(request, absence_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM absences WHERE id = ?", (absence_id,))
    conn.commit()
    conn.close()
    return request.send_json(200, {'message': 'Absence deleted'})

# Register Routes
router.add('GET', '/api/absences', get_absences)
router.add('POST', '/api/absences', create_absence)
router.add('PUT', '/api/absences/(\d+)', update_absence)
router.add('DELETE', '/api/absences/(\d+)', delete_absence)
