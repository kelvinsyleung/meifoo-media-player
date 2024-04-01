import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class VideoHTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = '/index.html'
        elif self.path.startswith('/videos'):
            self.path = '.' + self.path
        return SimpleHTTPRequestHandler.do_GET(self)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)

def run(server_class=ThreadingHTTPServer, handler_class=VideoHTTPRequestHandler):
    server_address = ('', 8000)
    httpd = server_class(server_address, handler_class)
    print(f'Starting httpd on port {server_address[1]}...')
    httpd.serve_forever()

if __name__ == "__main__":
    run()
