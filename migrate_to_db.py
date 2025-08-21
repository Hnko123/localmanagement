"""
JSON dosyasını SQLModel tabanlı PostgreSQL veritabanına aktarır.
Run: python migrate_to_db.py
"""
import json
from pathlib import Path
from datetime import datetime

# Settings path (default to root settings.json)
SETTINGS_PATH = Path(__file__).parent / "settings.json"
with open(SETTINGS_PATH) as f:
    settings = json.load(f)

DATA_DIR = Path(settings["files"]["orders_json"]).parent
ORDERS_FILE = DATA_DIR / "etsy_orders.json"

from app.models import Order
from app.db import SessionContext

if not ORDERS_FILE.exists():
    print("❌ orders.json bulunamadı")
    exit(1)

with open(ORDERS_FILE) as f:
    orders = json.load(f)

print(f"🔢 {len(orders)} sipariş JSON’dan okunuyor...")

with SessionContext() as session:
    for o in orders:
        try:
            order_obj = Order(
                transaction_id=o["transaction_id"],
                order_date=datetime.fromisoformat(o["order_date"]),
                status=o.get("status", "pending"),
                product_name=o["product"]["name"],
                image_url=o["product"]["image_url"],
                material_size=o["product"]["material_size"],
                chain_length=o["product"]["chain_length"],
                personalization=o["product"]["personalization"],
                quantity=o["product"]["quantity"],
                customer_name=o["customer"]["name"],
                customer_email=o["customer"]["email"],
                customer_address=o["customer"]["address"],
                customer_note=o["customer"].get("note", ""),
                item_price=o["pricing"]["item_price"],
                discount=o["pricing"]["discount"],
                sales_tax=o["pricing"]["sales_tax"],
                order_total=o["pricing"]["order_total"],
                shop_name=o["shop"]["name"],
                ioss_number=o["shop"]["ioss_number"],
                vat_collected=o["vat"]["vat_collected"],
                vat_id=o["vat"]["vat_id"],
                vat_paid_chf=o["vat"]["vat_paid_chf"],
                cut=o["fulfillment"]["cut"],
                ready=o["fulfillment"]["ready"],
                shipped=o["fulfillment"]["shipped"],
                tracking_number=o["fulfillment"]["tracking_number"],
                shipping_date=datetime.fromisoformat(o["fulfillment"]["shipping_date"]) if o["fulfillment"]["shipping_date"] else None,
                notes=o["fulfillment"]["notes"],
                created_at=datetime.fromisoformat(o["meta"]["created_at"]),
                updated_at=datetime.fromisoformat(o["meta"]["updated_at"])
            )
            session.add(order_obj)
        except Exception as e:
            print(f"⚠️  Sipariş {o.get('transaction_id')} eklenemedi: {e}")
    session.commit()
print("✅ JSON verisi DB’ye aktarıldı")
