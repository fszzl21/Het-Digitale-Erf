# Camping Dashboard - Pure Python Backend

Dit is een pure Python backend die gebruik maakt van de Standard Library (`http.server`, `sqlite3`). Er is **GEEN** `pip install` nodig en geen externe frameworks.

## Installatie & Starten

### Voorwaarden
- Python 3.x geïnstalleerd.

### Starten
1. Open een terminal in de `backend` map.
2. Run de server:
   ```bash
   python server.py
   ```
   De server draait op `http://localhost:8000`.
   De database `camping.db` wordt automatisch aangemaakt met een standaard admin user.

### Inloggen
- **Username:** `admin`
- **Password:** `admin123`

## API Endpoints & Voorbeelden

Gebruik `curl` of Python `requests` om te testen. Voeg de Authorization header toe na login.

### 1. Authenticatie

**Login**
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```
*Response ontvangt een `token`. Gebruik deze in de header: `Authorization: Bearer <TOKEN>`.*

**Logout**
```bash
curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

### 2. Reserveringen (/api/reservations)

**Ophalen**
```bash
curl http://localhost:8000/api/reservations
```

**Aanmaken**
```bash
curl -X POST http://localhost:8000/api/reservations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"date": "2025-08-01", "name": "Jan Jansen", "pitch_number": 10, "guest_count": 2}'
```

**Updaten**
```bash
curl -X PUT http://localhost:8000/api/reservations/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"status": "confirmed"}'
```

**Verwijderen**
```bash
curl -X DELETE http://localhost:8000/api/reservations/1 \
  -H "Authorization: Bearer <TOKEN>"
```

### 3. Bezetting (/api/occupancy)
Haalt status op van alle 50 plekken.
```bash
curl http://localhost:8000/api/occupancy
```

**Update Status**
```bash
curl -X PUT http://localhost:8000/api/occupancy/10 \
  -H "Content-Type: application/json" \
  -d '{"status": "occupied"}'
```

### 4. Overige Modules
Dezelfde structuur geldt voor:
- **Gasten:** `/api/guests`
- **Taken:** `/api/tasks`
- **Verzuim:** `/api/absences`
- **Activiteiten:** `/api/activities`

## Bestandsstructuur
- `server.py`: Startpunt en HTTP server logica.
- `router.py`: Custom router voor URL matching.
- `database.py`: Database connectie en schema setup.
- `handlers/`: Bevat de logica voor elk onderdeel (auth, reservations, etc).
