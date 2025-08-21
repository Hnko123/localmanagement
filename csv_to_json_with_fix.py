#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSV to JSON Converter + Image Fix
=================================
CSV'yi JSON'a çevirir ve image URL'leri 75x75 yapar
"""

import csv
import json
import re
from pathlib import Path

def csv_to_json_with_image_fix():
    """CSV'yi JSON'a çevir ve image URL'leri düzelt"""
    csv_file = Path("data/etsy_orders.csv")
    json_file = Path("data/etsy_orders.json")
    
    if not csv_file.exists():
        print("❌ CSV dosyası bulunamadı!")
        return
    
    print(f"📄 CSV dosyası bulundu: {csv_file}")
    
    orders = []
    
    # CSV'yi oku
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            # CSV row'unu JSON formatına çevir
            order = {
                "id": int(row['transaction_id']) if row['transaction_id'] else 0,
                "transaction_id": int(row['transaction_id']) if row['transaction_id'] else 0,
                "order_date": row['order_date'],
                "status": row['status'] or "pending",
                "product": {
                    "name": row['product_name'],
                    "image_url": row['product_image_url'],  # Bu field'ı düzelteceğiz
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
                "vat": {
                    "vat_collected": row['vat_collected'],
                    "vat_id": row['vat_id'],
                    "vat_paid_chf": row['vat_paid_chf']
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
                order["product"]["image_url"] = new_url
                print(f"🔧 Fixed Order {order['transaction_id']}: Image URL -> il_75x75")
            
            orders.append(order)
    
    print(f"📊 {len(orders)} order CSV'den yüklendi")
    
    # JSON'a kaydet
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(orders, f, indent=2, ensure_ascii=False)
    
    print(f"✅ JSON dosyası oluşturuldu: {json_file}")
    print(f"🖼️ Tüm image URL'leri 75x75 boyutuna ayarlandı")

if __name__ == "__main__":
    csv_to_json_with_image_fix()
