#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Data Synchronization Script
==========================

JSON dosyasından SQLite database'e veri senkronizasyonu yapar.
"""

import json
import sqlite3
from pathlib import Path
from datetime import datetime

def sync_json_to_db():
    """JSON dosyasından database'e veri senkronizasyonu"""
    
    # Path'leri tanımla
    app_dir = Path(__file__).parent.absolute()
    json_file = app_dir / "data" / "etsy_orders.json"
    db_file = app_dir / "orders.db"
    
    print(f"🔄 JSON'dan Database'e senkronizasyon başlatılıyor...")
    print(f"📁 JSON dosyası: {json_file}")
    print(f"🗄️  Database: {db_file}")
    
    # JSON dosyasını oku
    if not json_file.exists():
        print("❌ JSON dosyası bulunamadı!")
        return False
        
    with open(json_file, 'r', encoding='utf-8') as f:
        orders = json.load(f)
    
    print(f"📊 {len(orders)} sipariş bulundu")
    
    # Database bağlantısı
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Tablo oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER UNIQUE,
            order_date TEXT,
            status TEXT DEFAULT 'pending',
            product_name TEXT,
            image_url TEXT,
            material_size TEXT,
            chain_length TEXT,
            personalization TEXT,
            quantity INTEGER,
            customer_name TEXT,
            customer_email TEXT,
            customer_address TEXT,
            customer_note TEXT,
            item_price REAL,
            discount REAL,
            sales_tax REAL,
            order_total REAL,
            shop_name TEXT,
            ioss_number TEXT,
            vat_collected TEXT,
            vat_id TEXT,
            vat_paid_chf TEXT,
            cut BOOLEAN DEFAULT 0,
            ready BOOLEAN DEFAULT 0,
            shipped BOOLEAN DEFAULT 0,
            tracking_number TEXT,
            shipping_date TEXT,
            notes TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    ''')
    
    # Mevcut verileri temizle
    cursor.execute("DELETE FROM orders")
    
    # Verileri ekle
    for order in orders:
        cursor.execute('''
            INSERT INTO orders (
                transaction_id, order_date, status, product_name, image_url,
                material_size, chain_length, personalization, quantity,
                customer_name, customer_email, customer_address, customer_note,
                item_price, discount, sales_tax, order_total, shop_name,
                ioss_number, vat_collected, vat_id, vat_paid_chf,
                cut, ready, shipped, tracking_number, shipping_date, notes,
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order.get('transaction_id'),
            order.get('order_date'),
            order.get('status', 'pending'),
            order.get('product_name'),
            order.get('image_url'),
            order.get('material_size'),
            order.get('chain_length'),
            order.get('personalization'),
            order.get('quantity'),
            order.get('customer_name'),
            order.get('customer_email'),
            order.get('customer_address'),
            order.get('customer_note'),
            order.get('item_price'),
            order.get('discount'),
            order.get('sales_tax'),
            order.get('order_total'),
            order.get('shop_name'),
            order.get('ioss_number'),
            order.get('vat_collected'),
            order.get('vat_id'),
            order.get('vat_paid_chf'),
            order.get('cut', False),
            order.get('ready', False),
            order.get('shipped', False),
            order.get('tracking_number'),
            order.get('shipping_date'),
            order.get('notes', ''),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
    
    # Commit ve kapat
    conn.commit()
    conn.close()
    
    print(f"✅ {len(orders)} sipariş database'e senkronize edildi!")
    return True

def sync_db_to_json():
    """Database'den JSON dosyasına veri senkronizasyonu"""
    
    # Path'leri tanımla
    app_dir = Path(__file__).parent.absolute()
    json_file = app_dir / "data" / "etsy_orders.json"
    db_file = app_dir / "orders.db"
    
    print(f"🔄 Database'den JSON'a senkronizasyon başlatılıyor...")
    
    # Database bağlantısı
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    
    # Verileri çek
    cursor.execute('''
        SELECT * FROM orders ORDER BY transaction_id DESC
    ''')
    
    rows = cursor.fetchall()
    conn.close()
    
    if not rows:
        print("❌ Database'de veri bulunamadı!")
        return False
    
    # Column names
    columns = [
        'id', 'transaction_id', 'order_date', 'status', 'product_name', 'image_url',
        'material_size', 'chain_length', 'personalization', 'quantity',
        'customer_name', 'customer_email', 'customer_address', 'customer_note',
        'item_price', 'discount', 'sales_tax', 'order_total', 'shop_name',
        'ioss_number', 'vat_collected', 'vat_id', 'vat_paid_chf',
        'cut', 'ready', 'shipped', 'tracking_number', 'shipping_date', 'notes',
        'created_at', 'updated_at'
    ]
    
    # JSON formatına çevir
    orders = []
    for row in rows:
        order = dict(zip(columns, row))
        # id'yi çıkar
        order.pop('id', None)
        orders.append(order)
    
    # JSON dosyasına yaz
    json_file.parent.mkdir(exist_ok=True)
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(orders, f, indent=2, ensure_ascii=False)
    
    print(f"✅ {len(orders)} sipariş JSON dosyasına senkronize edildi!")
    return True

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "reverse":
        sync_db_to_json()
    else:
        sync_json_to_db()
