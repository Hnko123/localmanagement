#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import re
from pathlib import Path

def main():
    print("🔄 CSV'yi JSON'a çeviriliyor ve image URL'leri 75x75'e düzeltiliyor...")
    
    # Dosya yolları
    csv_file = Path(r"C:\Users\Hakan\Desktop\gmail\portable_etsy_manager\data\etsy_orders.csv")
    json_file = Path(r"C:\Users\Hakan\Desktop\gmail\portable_etsy_manager\data\etsy_orders.json")
    
    if not csv_file.exists():
        print(f"❌ CSV dosyası bulunamadı: {csv_file}")
        return
    
    print(f"📄 CSV dosyası bulundu: {csv_file}")
    
    orders = []
    fixed_count = 0
    
    # CSV'yi oku
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # JSON formatına çevir
            order = {
                "id": int(row['transaction_id']) if row['transaction_id'] else 0,
                "transaction_id": int(row['transaction_id']) if row['transaction_id'] else 0,
                "order_date": row['order_date'],
                "status": row['status'] or "pending",
                "product": {
                    "name": row['product_name'],
                    "image_url": row['product_image_url'],
                    "material_size": row['material_size'],
                    "chain_length": row['chain_length'],
                    "personalization": row['personalization'],
                    "quantity": int(row['quantity']) if row['quantity'] else 1
                },
                "customer": {
                    "name": row['customer_name'],
                    "email": row['customer_email'],
                    "address": row['customer_address'],
                    "note": row['customer_note']
                },
                "pricing": {
                    "item_price": float(row['item_price']) if row['item_price'] else 0.0,
                    "discount": float(row['discount']) if row['discount'] else 0.0,
                    "sales_tax": float(row['sales_tax']) if row['sales_tax'] else 0.0,
                    "order_total": float(row['order_total']) if row['order_total'] else 0.0,
                    "currency": "USD"
                },
                "shop": {
                    "name": row['shop_name'],
                    "ioss_number": row['ioss_number']
                },
                "fulfillment": {
                    "cut": row['cut'].lower() == 'true' if row['cut'] else False,
                    "ready": row['ready'].lower() == 'true' if row['ready'] else False,
                    "shipped": row['shipped'].lower() == 'true' if row['shipped'] else False,
                    "tracking_number": "",
                    "shipping_date": None,
                    "notes": row['notes']
                },
                "meta": {
                    "created_at": row['created_at'],
                    "updated_at": row['created_at'],
                    "source": "portable_etsy_manager"
                }
            }
            
            # Image URL'yi 75x75'e çevir
            image_url = order["product"]["image_url"]
            if image_url and "i.etsystatic.com" in image_url:
                new_url = re.sub(r'il_\d+x\d+', 'il_75x75', image_url)
                if new_url != image_url:
                    order["product"]["image_url"] = new_url
                    fixed_count += 1
                    if fixed_count <= 5:  # İlk 5 tanesini logla
                        print(f"🔧 Fixed Order {order['transaction_id']}: 250x250 -> 75x75")
            
            orders.append(order)
    
    print(f"📊 {len(orders)} order CSV'den yüklendi")
    
    # JSON'a kaydet
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(orders, f, indent=2, ensure_ascii=False)
    
    print(f"✅ JSON dosyası oluşturuldu: {json_file}")
    print(f"🖼️ {fixed_count} image URL düzeltildi (250x250 -> 75x75)")
    
    # İlk birkaç order'ın image URL'ini kontrol et
    print("\n📋 Örnek image URL'leri:")
    for i, order in enumerate(orders[:3], 1):
        image_url = order["product"]["image_url"]
        status = "✅" if "il_75x75" in image_url else "❌"
        filename = image_url.split('/')[-1] if image_url else "No image"
        print(f"{i}. {order['customer']['name']}: {status} {filename}")

if __name__ == "__main__":
    main()
