import sys
sys.path.append(r'C:\Users\Hakan\\gmail\\portable_etsy_manager')
from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)
# GET /api/orders
resp = client.get("/api/orders")
print('Status code:', resp.status_code)
print('JSON length:', len(resp.json()))