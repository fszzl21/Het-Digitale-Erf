
import json
from router import router
from database import get_db_connection

# --- HR: Employees ---


# Validations
def get_employees(handler, *args):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admin_employees")
    employees = [dict(row) for row in cursor.fetchall()]
    conn.close()
    handler.send_json(200, employees)

def add_employee(handler, *args):
    data = handler.get_json_body()
    # Basic validation
    if not data.get('id') or not data.get('name'):
        handler.send_error(400, "Missing id or name")
        return

    conn = get_db_connection()
    try:
        conn.execute(
            "INSERT INTO admin_employees (id, name, role, leave_balance) VALUES (?, ?, ?, ?)",
            (data['id'], data['name'], data.get('role', 'medewerker'), data.get('leave_balance', 200.0))
        )
        conn.commit()
        handler.send_json(201, {"message": "Employee created"})
    except Exception as e:
        handler.send_error(500, str(e))
    finally:
        conn.close()

# --- HR: Leave Requests ---

def get_leave_requests(handler, *args):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Join with employee name for convenience
    query = """
        SELECT r.*, e.name as employee_name 
        FROM admin_leave_requests r
        JOIN admin_employees e ON r.employee_id = e.id
    """
    cursor.execute(query)
    requests = [dict(row) for row in cursor.fetchall()]
    conn.close()
    handler.send_json(200, requests)

def request_leave(handler, *args):
    data = handler.get_json_body()
    # Expected: id, employee_id, start_date, end_date, total_hours
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Check employee balance
    cursor.execute("SELECT leave_balance FROM admin_employees WHERE id = ?", (data['employee_id'],))
    res = cursor.fetchone()
    if not res:
        conn.close()
        handler.send_error(404, "Employee not found")
        return
        
    balance = res[0]
    needed = float(data['total_hours'])
    
    # Logic from original HRManager: Check balance
    if balance < needed:
        conn.close()
        handler.send_json(400, {"error": f"Insufficient balance. Has {balance}, needs {needed}"})
        return

    try:
        cursor.execute(
            """INSERT INTO admin_leave_requests 
               (id, employee_id, start_date, end_date, total_hours, reason, status) 
               VALUES (?, ?, ?, ?, ?, ?, 'AANGEVRAAGD')""",
            (data['id'], data['employee_id'], data['start_date'], data['end_date'], needed, data.get('reason', ''))
        )
        conn.commit()
        handler.send_json(201, {"message": "Leave requested"})
    except Exception as e:
        handler.send_error(500, str(e))
    finally:
        conn.close()

def approve_leave(handler, request_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get request
    cursor.execute("SELECT * FROM admin_leave_requests WHERE id = ?", (request_id,))
    req = cursor.fetchone()
    if not req:
        conn.close()
        handler.send_error(404, "Request not found")
        return
    
    if req['status'] == 'GOEDGEKEURD':
        conn.close()
        handler.send_json(400, {"message": "Already approved"})
        return

    # Deduction Logic from HRManager
    # 1. Update status
    # 2. Update employee balance
    try:
        cursor.execute("UPDATE admin_leave_requests SET status = 'GOEDGEKEURD' WHERE id = ?", (request_id,))
        cursor.execute("UPDATE admin_employees SET leave_balance = leave_balance - ? WHERE id = ?", (req['total_hours'], req['employee_id']))
        conn.commit()
        handler.send_json(200, {"message": "Approved"})
    except Exception as e:
        handler.send_error(500, str(e))
    finally:
        conn.close()

# Register Routes
router.add('GET', r'/api/admin/employees', get_employees)
router.add('POST', r'/api/admin/employees', add_employee)
router.add('GET', r'/api/admin/leave', get_leave_requests)
router.add('POST', r'/api/admin/leave', request_leave)
router.add('POST', r'/api/admin/leave/([^/]+)/approve', approve_leave)

