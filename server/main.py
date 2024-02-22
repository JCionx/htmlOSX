import json
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

access_password = "GLaDOS"
port = 8000

with open('data.json') as f:
    json_data = json.load(f)
    print(json_data)

# Function to handle HTTP requests
class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse query parameters
        query_params = parse_qs(urlparse(self.path).query)
        password = query_params.get("password", [None])[0]

        # Check password
        if password == access_password:
            # Send JSON response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header('Access-Control-Allow-Origin', '*')  # Add this line
            self.end_headers()
            self.wfile.write(json.dumps(json_data).encode())
        else:
            # Send error response
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.send_header('Access-Control-Allow-Origin', '*')  # And this line
            self.end_headers()
            self.wfile.write(json.dumps({"message": "Unauthorized", "status": "error"}).encode())

# Run server
server_address = ("", port)
httpd = HTTPServer(server_address, RequestHandler)
print("Starting server on port 8000...")
httpd.serve_forever()