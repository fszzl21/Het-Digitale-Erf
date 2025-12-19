import http.server
import socketserver
import json
import logging
from router import Router, router
from database import init_db

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

PORT = 8000
# router = Router() # Removed, using imported singleton

class CustomRequestHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()

    def handle_request(self, method):
        handler, groups = router.match(method, self.path)
        
        if handler:
            try:
                # Execute variable handler with capture groups
                handler(self, *groups)
            except Exception as e:
                logging.error(f"Error handling {method} {self.path}: {e}")
                self.send_error(500, "Internal Server Error")
        else:
            self.send_error(404, "Not Found")

    def do_GET(self):
        self.handle_request('GET')

    def do_POST(self):
        self.handle_request('POST')

    def do_PUT(self):
        self.handle_request('PUT')

    def do_DELETE(self):
        self.handle_request('DELETE')
    
    # Helper to send JSON response
    def send_json(self, status, data):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

    # Helper to parse JSON body
    def get_json_body(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return {}
        body = self.rfile.read(content_length).decode('utf-8')
        return json.loads(body)

def run():
    init_db()
    
    # Import handlers to register routes
    # This must be done inside run or after router is created
    import handlers.auth
    import handlers.reservations
    import handlers.occupancy
    import handlers.guests
    import handlers.tasks
    import handlers.absences
    import handlers.activities

    print(f"Starting server on http://localhost:{PORT}")
    server = http.server.ThreadingHTTPServer(('', PORT), CustomRequestHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        server.server_close()

if __name__ == '__main__':
    run()
