from database import get_db_connection
from router import router

def get_guests(request):
    conn = get_db_connection()
    guests = conn.execute("SELECT * FROM guests").fetchall()
    conn.close()
    result = [dict(row) for row in guests]
    return request.send_json(200, result)

def create_guest(request):
    data = request.get_json_body()
    if 'name' not in data:
        return request.send_json(400, {'error': 'Name is required'})

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO guests (name, email, phone, address) VALUES (?, ?, ?, ?)",
            (data['name'], data.get('email'), data.get('phone'), data.get('address'))
        )
        conn.commit()
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return request.send_json(201, {'id': new_id, 'message': 'Guest created'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def update_guest(request, guest_id):
    data = request.get_json_body()
    conn = get_db_connection()
    fields = []
    values = []
    
    for key in ['name', 'email', 'phone', 'address']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
            
    if not fields:
         conn.close()
         return request.send_json(400, {'error': 'No fields to update'})
         
    values.append(guest_id)
    try:
        conn.execute(f"UPDATE guests SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        return request.send_json(200, {'message': 'Guest updated'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def delete_guest(request, guest_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM guests WHERE id = ?", (guest_id,))
    conn.commit()
    conn.close()
    return request.send_json(200, {'message': 'Guest deleted'})

# Register Routes
router.add('GET', '/api/guests', get_guests)
router.add('POST', '/api/guests', create_guest)
router.add('PUT', '/api/guests/(\d+)', update_guest)
router.add('DELETE', '/api/guests/(\d+)', delete_guest)
