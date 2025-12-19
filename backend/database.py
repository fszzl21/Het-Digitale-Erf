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

    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
