from database import get_db_connection, hash_password
import sqlite3

def create_user():
    username = "Boer Bert"
    password = "Bert123"
    role = "Beheerder" # Giving him Admin rights as implied by the dashboard logic
    
    password_hash = hash_password(password)
    
    conn = get_db_connection()
    try:
        conn.execute("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", 
                     (username, password_hash, role))
        conn.commit()
        print(f"User '{username}' created successfully.")
    except sqlite3.IntegrityError:
        print(f"User '{username}' already exists.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    create_user()
