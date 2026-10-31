import json
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import traceback

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                k, v = line.strip().split('=', 1)
                os.environ[k] = v

try:
    import adaption
except ImportError:
    adaption = None

PORT = 5001

class AdaptionHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Adaption-Key')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/api/adaption/status':
            api_key = os.environ.get('ADAPTION_API_KEY', '')
            self._set_headers(200)
            self.wfile.write(json.dumps({
                "sdkInstalled": adaption is not None,
                "hasEnvKey": bool(api_key),
                "status": "connected" if (adaption and api_key) else "waiting_key",
                "defaultModel": "deepseek-v4-flash"
            }).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/api/adaption/chat':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                body = json.loads(post_data.decode('utf-8'))
            except Exception:
                self._set_headers(400)
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode('utf-8'))
                return

            api_key = (
                body.get('apiKey') or 
                self.headers.get('X-Adaption-Key') or 
                os.environ.get('ADAPTION_API_KEY')
            )

            if not api_key:
                self._set_headers(400)
                self.wfile.write(json.dumps({
                    "error": "No Adaption API Key provided."
                }).encode('utf-8'))
                return

            if not adaption:
                self._set_headers(500)
                self.wfile.write(json.dumps({"error": "adaption python package not installed"}).encode('utf-8'))
                return

            prompt = body.get('prompt', '')
            user_profile = body.get('userProfile', {})
            language = body.get('language', 'en')
            model_name = body.get('model') or 'deepseek-v4-flash'

            system_instructions = (
                f"You are the official LiFE AI Coach for Gujarat Energy Development Agency (GEDA) Mission LiFE. "
                f"Citizen: Name={user_profile.get('name', 'Citizen')}, City={user_profile.get('city', 'Mumbai')}, "
                f"Monthly Electricity={user_profile.get('monthlyElectricityUnits', 280)} kWh, "
                f"AC runtime={user_profile.get('acUsageHours', 6)} hrs/day, "
                f"Carbon Footprint={user_profile.get('monthlyFootprintKg', 428)} kg CO2e, "
                f"LiFE Score={user_profile.get('lifeScore', 742)}. "
                f"Provide concise, highly actionable sustainability advice connecting daily habits to measurable climate and financial savings. "
                f"Respond in language code: {language}."
            )

            try:
                client = adaption.Adaption(api_key=api_key)
                response = client.responses.create(
                    model=model_name,
                    instructions=system_instructions,
                    input=prompt,
                    max_output_tokens=600,
                    temperature=0.7
                )
                
                output_text = ""
                if getattr(response, 'output_text', None) and isinstance(response.output_text, str):
                    output_text = response.output_text
                elif getattr(response, 'output', None) and isinstance(response.output, list):
                    for item in response.output:
                        if hasattr(item, 'content') and isinstance(item.content, list):
                            for c in item.content:
                                if hasattr(c, 'text') and c.text:
                                    output_text += c.text + "\n"
                
                if not output_text:
                    output_text = "Action plan: Adjust AC to 26°C and check rooftop solar feasibility on GEDA portal."

                self._set_headers(200)
                self.wfile.write(json.dumps({
                    "success": True,
                    "text": output_text.strip(),
                    "model": model_name,
                    "provider": "Adaptation AI Platform"
                }).encode('utf-8'))

            except Exception as e:
                traceback.print_exc()
                self._set_headers(500)
                self.wfile.write(json.dumps({
                    "error": str(e),
                    "fallbackAvailable": True
                }).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

def run():
    server = HTTPServer(('127.0.0.1', PORT), AdaptionHandler)
    print(f"🌱 Adaptation Platform Bridge listening on http://127.0.0.1:{PORT}")
    server.serve_forever()

if __name__ == '__main__':
    run()
