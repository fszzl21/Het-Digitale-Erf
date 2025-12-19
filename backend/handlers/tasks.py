from database import get_db_connection
from router import router

def get_tasks(request):
    conn = get_db_connection()
    tasks = conn.execute("SELECT * FROM tasks").fetchall()
    conn.close()
    result = [dict(row) for row in tasks]
    return request.send_json(200, result)

def create_task(request):
    data = request.get_json_body()
    if 'title' not in data:
        return request.send_json(400, {'error': 'Title is required'})

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO tasks (title, description, priority, status, deadline, assigned_to) VALUES (?, ?, ?, ?, ?, ?)",
            (data['title'], data.get('description'), data.get('priority', 'normal'), 
             data.get('status', 'todo'), data.get('deadline'), data.get('assigned_to'))
        )
        conn.commit()
        new_id = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
        return request.send_json(201, {'id': new_id, 'message': 'Task created'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def update_task(request, task_id):
    data = request.get_json_body()
    conn = get_db_connection()
    fields = []
    values = []
    
    for key in ['title', 'description', 'priority', 'status', 'deadline', 'assigned_to']:
        if key in data:
            fields.append(f"{key} = ?")
            values.append(data[key])
            
    if not fields:
         conn.close()
         return request.send_json(400, {'error': 'No fields to update'})
         
    values.append(task_id)
    try:
        conn.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", values)
        conn.commit()
        return request.send_json(200, {'message': 'Task updated'})
    except Exception as e:
        return request.send_json(500, {'error': str(e)})
    finally:
        conn.close()

def delete_task(request, task_id):
    conn = get_db_connection()
    conn.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    conn.close()
    return request.send_json(200, {'message': 'Task deleted'})

# Register Routes
router.add('GET', '/api/tasks', get_tasks)
router.add('POST', '/api/tasks', create_task)
router.add('PUT', '/api/tasks/(\d+)', update_task)
router.add('DELETE', '/api/tasks/(\d+)', delete_task)
