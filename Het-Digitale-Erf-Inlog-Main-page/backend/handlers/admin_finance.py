
import json
from router import router
from database import get_db_connection

# --- Finance: Ledger ---


# --- Finance: Ledger ---

def get_ledger(handler, *args):
    conn = get_db_connection()
    cursor = conn.cursor()
    # Calculate balance per account (Debit - Credit)
    query = """
        SELECT a.*, COALESCE(SUM(l.debit), 0) - COALESCE(SUM(l.credit), 0) as balance
        FROM admin_ledger_accounts a
        LEFT JOIN admin_booking_lines l ON a.code = l.account_code
        GROUP BY a.code
        ORDER BY a.code
    """
    cursor.execute(query)
    accounts = [dict(row) for row in cursor.fetchall()]
    conn.close()
    handler.send_json(200, accounts)

# --- Finance: Bookings ---

def get_bookings(handler, *args):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all bookings
    cursor.execute("SELECT * FROM admin_bookings ORDER BY date DESC")
    bookings = [dict(row) for row in cursor.fetchall()]
    
    # For each booking, get lines (N+1 problem but fine for small scale)
    for b in bookings:
        cursor.execute("SELECT * FROM admin_booking_lines WHERE booking_id = ?", (b['id'],))
        b['lines'] = [dict(row) for row in cursor.fetchall()]
        
    conn.close()
    handler.send_json(200, bookings)

def add_booking(handler, *args):
    data = handler.get_json_body()
    # Expected: id, date, period, journal_type, lines: [{account_code, description, debit, credit}]
    
    lines = data.get('lines', [])
    
    # Logic from Boeking.is_in_balans
    total_debit = sum(float(l.get('debit', 0)) for l in lines)
    total_credit = sum(float(l.get('credit', 0)) for l in lines)
    
    if abs(total_debit - total_credit) > 0.01: # Check balance with slight tolerance for float
        handler.send_json(400, {"error": f"Booking not in balance. Debit: {total_debit}, Credit: {total_credit}"})
        return

    conn = get_db_connection()
    try:
        # Header
        conn.execute(
            "INSERT INTO admin_bookings (id, date, period, journal_type) VALUES (?, ?, ?, ?)",
            (data['id'], data['date'], data['period'], data['journal_type'])
        )
        
        # Lines
        for line in lines:
            conn.execute(
                """INSERT INTO admin_booking_lines 
                   (booking_id, account_code, description, debit, credit) 
                   VALUES (?, ?, ?, ?, ?)""",
                (data['id'], line['account_code'], line['description'], float(line.get('debit', 0)), float(line.get('credit', 0)))
            )
            
        conn.commit()
        handler.send_json(201, {"message": "Booking created"})
    except Exception as e:
        handler.send_error(500, str(e))
    finally:
        conn.close()


from decimal import Decimal
from rapportage import RapportageEngine
from grootboek import GrootboekRekening, RekeningType, BalansZijde

# --- Finance: Reports ---

def get_reports(handler, *args):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Haal rekeningschema op en converteer naar Objecten voor de Engine
    cursor.execute("SELECT * FROM admin_ledger_accounts")
    accounts_db = cursor.fetchall()
    
    rekening_objecten = []
    for row in accounts_db:
        # Mapping string uit DB naar Enum
        rtype = RekeningType.BALANS if row['type'] == 'BALANS' else RekeningType.WINST_VERLIES
        # Standaard zijde gokken op basis van type (of uitbreiden in DB)
        # Voor nu hardcoded logica voor standaard zijde op basis van nummer of type
        # Activa (1xxx) = Debet, Passiva (16xx) = Credit, Kosten (4xxx) = Debet, Omzet (8xxx) = Credit
        code = int(row['code'])
        if code < 1600: zijde = BalansZijde.DEBET
        elif code < 2000: zijde = BalansZijde.CREDIT
        elif code < 8000: zijde = BalansZijde.DEBET # Kosten
        else: zijde = BalansZijde.CREDIT # Omzet
        
        rekening_objecten.append(GrootboekRekening(
            code=row['code'],
            naam=row['name'],
            type=rtype,
            standaard_zijde=zijde
        ))
        
    engine = RapportageEngine(rekening_objecten)
    
    # 2. Haal alle saldi op
    # Sommeer alle regels per account code.
    # Debet is positief, Credit is negatief voor de som.
    cursor.execute("""
        SELECT account_code, SUM(debit - credit) as saldo 
        FROM admin_booking_lines 
        GROUP BY account_code
    """)
    saldi_db = cursor.fetchall()
    
    # Converteer naar Dictionary { "1000": Decimal(100.00) }
    saldi_dict = {}
    for row in saldi_db:
        saldi_dict[row['account_code']] = Decimal(str(row['saldo']))
        
    conn.close()
    
    # 3. Laat de engine rekenen
    balans = engine.genereer_balans(saldi_dict)
    winst_verlies = engine.genereer_winst_verlies(saldi_dict)
    
    # 4. Return JSON (convert Decimals to float/str for JSON serialization)
    def decimal_to_float(obj):
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError
    
    response = {
        "balans": balans,
        "winst_verlies": winst_verlies
    }
    
    handler.send_response(200)
    handler.send_header('Content-Type', 'application/json')
    handler.send_header('Access-Control-Allow-Origin', '*')
    handler.end_headers()
    handler.wfile.write(json.dumps(response, default=decimal_to_float).encode('utf-8'))

# Register Routes
router.add('GET', r'/api/admin/ledger', get_ledger)
router.add('GET', r'/api/admin/bookings', get_bookings)
router.add('POST', r'/api/admin/bookings', add_booking)
router.add('GET', r'/api/admin/reports', get_reports)

