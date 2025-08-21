import requests
import json
from pathlib import Path

def test_api():
    print("🧪 API Test Başlatılıyor...")
    print("-" * 40)
    
    base_url = "http://localhost:8000"
    
    # 1. Health check
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Health check: OK")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # 2. Orders endpoint test
    try:
        response = requests.get(f"{base_url}/api/orders", timeout=10)
        if response.status_code == 200:
            orders = response.json()
            print(f"✅ Orders endpoint: OK")
            print(f"   Toplam order sayısı: {len(orders)}")
            if orders:
                print(f"   İlk order ID: {orders[0].get('transaction_id')}")
                print(f"   İlk customer: {orders[0].get('customer', {}).get('name', 'N/A')}")
        else:
            print(f"❌ Orders endpoint failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Orders endpoint error: {e}")
    
    # 3. Frontend test
    try:
        response = requests.get(base_url, timeout=5)
        if response.status_code == 200:
            print("✅ Frontend: OK")
            if "Portable Etsy Manager" in response.text:
                print("   Frontend içeriği yüklendi")
        else:
            print(f"❌ Frontend failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend error: {e}")
    
    print("\n" + "=" * 40)
    print("Test tamamlandı!")

if __name__ == "__main__":
    test_api()
