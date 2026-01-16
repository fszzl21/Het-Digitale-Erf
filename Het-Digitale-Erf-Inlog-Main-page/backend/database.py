import sqlite3
import hashlib
import os

DB_NAME = 'camping.db'

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def init_db():
    if not os.path.exists(DB_NAME):
        print(f"Creating new database: {DB_NAME}")
    
    conn = get_db_connection()
    cursor = conn.cursor()

    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'medewerker'
    )
    ''')

    # Create default admin if not exists
    admin_password = hash_password("admin123")
    try:
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                       ('admin', admin_password, 'admin'))
        print("Default admin user created.")
    except sqlite3.IntegrityError:
        pass # Admin already exists

    # Create Boer Bert
    bert_password = hash_password("Bert123")
    try:
        cursor.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                       ('Boer Bert', bert_password, 'Beheerder'))
        print("User 'Boer Bert' created.")
    except sqlite3.IntegrityError:
        pass # User already exists

    # Sessions table for token auth
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )
    ''')

    # Reservations
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guest_name TEXT NOT NULL,
        pitch_number TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        guest_count INTEGER NOT NULL,
        status TEXT DEFAULT 'pending'
    )
    ''')

    # Occupancy (50 pitches)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS occupancy (
        pitch_number INTEGER PRIMARY KEY,
        status TEXT DEFAULT 'available' -- available, occupied, maintenance
    )
    ''')
    
    # Pre-populate pitches
    cursor.execute("SELECT count(*) FROM occupancy")
    if cursor.fetchone()[0] == 0:
        print("Initializing 50 camping pitches...")
        for i in range(1, 51):
            cursor.execute("INSERT INTO occupancy (pitch_number, status) VALUES (?, ?)", (i, 'available'))

    # Guests
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS guests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        address TEXT
    )
    ''')

    # Tasks
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'normal', -- low, normal, high
        status TEXT DEFAULT 'todo', -- todo, in-progress, done
        deadline TEXT,
        assigned_to TEXT
    )
    ''')

    # Absences
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS absences (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee TEXT NOT NULL,
        type TEXT NOT NULL, -- ziek, vakantie, anders
        start_date TEXT NOT NULL,
        end_date TEXT,
        reason TEXT
    )
    ''')

    # Activities
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        location TEXT,
        current_participants INTEGER DEFAULT 0,
        max_participants INTEGER
    )
    ''')
    
    # --- ADMINISTRATION MODULE TABLES ---

    # HR: Employees (Extension of Users or standalone)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_employees (
        id TEXT PRIMARY KEY, -- e.g. EMP001
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        leave_balance REAL DEFAULT 200.0
    )
    ''')

    # HR: Leave Requests
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_leave_requests (
        id TEXT PRIMARY KEY, -- e.g. REQ001
        employee_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        total_hours REAL NOT NULL,
        status TEXT DEFAULT 'AANGEVRAAGD', -- AANGEVRAAGD, GOEDGEKEURD, AFGEKEURD
        reason TEXT,
        FOREIGN KEY (employee_id) REFERENCES admin_employees (id)
    )
    ''')

    # Finance: Ledger Accounts (Grootboek)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_ledger_accounts (
        code TEXT PRIMARY KEY, -- e.g. 1000
        name TEXT NOT NULL,
        type TEXT NOT NULL -- BALANS / WINSTVERLIES
    )
    ''')

    # Finance: Bookings (Boekstukken)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_bookings (
        id TEXT PRIMARY KEY, -- e.g. 2025-001
        date TEXT NOT NULL,
        period INTEGER NOT NULL, -- 202501
        journal_type TEXT NOT NULL -- INK, VER, MEM, BANK
    )
    ''')

    # Finance: Booking Lines (Regels)
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_booking_lines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        booking_id TEXT NOT NULL,
        account_code TEXT NOT NULL,
        description TEXT,
        debit REAL DEFAULT 0.0,
        credit REAL DEFAULT 0.0,
        FOREIGN KEY (booking_id) REFERENCES admin_bookings (id),
        FOREIGN KEY (account_code) REFERENCES admin_ledger_accounts (code)
    )
    ''')

    # Calendar: Appointments
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT, -- theme in PHP version
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL
    )
    ''')

    # Pre-populate some data if empty
    cursor.execute("SELECT count(*) FROM admin_ledger_accounts")
    if cursor.fetchone()[0] == 0:
        print("Initializing default ledger accounts...")
        default_accounts = [
            ('1000', 'Kas', 'BALANS'),
            ('1100', 'Bank', 'BALANS'),
            ('1300', 'Debiteuren', 'BALANS'),
            ('1600', 'Crediteuren', 'BALANS'),
            ('8000', 'Omzet', 'WINSTVERLIES'),
            ('4000', 'Personeelskosten', 'WINSTVERLIES'),
            ('4500', 'Huisvestingskosten', 'WINSTVERLIES')
        ]
        cursor.executemany("INSERT INTO admin_ledger_accounts (code, name, type) VALUES (?, ?, ?)", default_accounts)

    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
