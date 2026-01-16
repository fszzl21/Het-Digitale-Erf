from database import get_db_connection
from router import router

def get_occupancy(request):
    conn = get_db_connection()
    occupancy = conn.execute("SELECT * FROM occupancy").fetchall()
    conn.close()
    
    result = [dict(row) for row in occupancy]
    return request.send_json(200, result)

def update_pitch_status(request, pitch_number):
    data = request.get_json_body()
    status = data.get('status')
    
    if not status:
         return request.send_json(400, {'error': 'Status is required'})

    conn = get_db_connection()
    try:
        conn.execute("UPDATE occupancy SET status = ? WHERE pitch_number = ?", (status, pitch_number))
        conn.commit()
        if conn.total_changes == 0:
             return request.send_json(404, {'error': 'Pitch not found'})
        return request.send_json(200, {'message': f'Pitch {pitch_number} updated to {status}'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

# Register Routes
router.add('GET', '/api/occupancy', get_occupancy)
router.add('PUT', '/api/occupancy/(\d+)', update_pitch_status)
