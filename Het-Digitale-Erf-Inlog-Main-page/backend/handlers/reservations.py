from database import get_db_connection
from router import router
import json

def get_reservations(request):
    conn = get_db_connection()
    reservations = conn.execute("SELECT * FROM reservations").fetchall()
    conn.close()
    
    result = [dict(row) for row in reservations]
    return request.send_json(200, result)

def create_reservation(request):
    data = request.get_json_body()
    # Validate required fields
    required = ['guest_name', 'pitch_number', 'start_date', 'end_date', 'guest_count']
    if not all(k in data for k in required):
        return request.send_json(400, {'error': 'Missing required fields'})

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO reservations (guest_name, pitch_number, start_date, end_date, guest_count, status) VALUES (?, ?, ?, ?, ?, ?)",
            (data['guest_name'], data['pitch_number'], data['start_date'], data['end_date'], data['guest_count'], data.get('status', 'pending'))
        )
        conn.commit()
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return request.send_json(201, {'id': new_id, 'message': 'Reservation created'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def update_reservation(request, reservation_id):
    data = request.get_json_body()
    if not data:
        return request.send_json(400, {'error': 'No data provided'})

    conn = get_db_connection()
    # We build the query dynamically based on provided fields
    fields = []
    values = []
    for key in ['guest_name', 'pitch_number', 'start_date', 'end_date', 'guest_count', 'status']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
    
    if not fields:
         conn.close()
         return request.send_json(400, {'error': 'No valid fields to update'})

    values.append(reservation_id)
    
    try:
        conn.execute(f"UPDATE reservations SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        return request.send_json(200, {'message': 'Reservation updated'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def delete_reservation(request, reservation_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM reservations WHERE id = ?", (reservation_id,))
    conn.commit()
    conn.close()
    return request.send_json(200, {'message': 'Reservation deleted'})

# Register Routes
router.add('GET', '/api/reservations', get_reservations)
router.add('POST', '/api/reservations', create_reservation)
router.add('PUT', '/api/reservations/(\\d+)', update_reservation)
router.add('DELETE', '/api/reservations/(\\d+)', delete_reservation)
