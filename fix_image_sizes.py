#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Image URL Quick Fix
===================
Mevcut orders JSON'ındaki image URL'lerini 75x75 boyutuna çevirir
"""

import json
import re
from pathlib import Path

def fix_image_urls():
    """JSON'daki image URL'lerini 75x75 boyutuna çevir"""
    json_file = Path("data/etsy_orders.json")
    
    if not json_file.exists():
        print("❌ JSON dosyası bulunamadı!")
        return
    
    # JSON'u yükle
    with open(json_file, 'r', encoding='utf-8') as f:
        orders = json.load(f)
    
    print(f"📊 {len(orders)} order yüklendi")
    
    fixed_count = 0
    
    # Her order'ın image URL'sini düzelt
    for order in orders:
        image_url = order.get("product", {}).get("image_url", "")
        
        if image_url and "i.etsystatic.com" in image_url:
            # Mevcut boyutu 75x75'e çevir
            new_url = re.sub(r'il_\d+x\d+', 'il_75x75', image_url)
            
            if new_url != image_url:
                order["product"]["image_url"] = new_url
                fixed_count += 1
                print(f"🔧 Fixed Order {order['transaction_id']}: {image_url.split('/')[-1]} -> il_75x75")
    
    # JSON'u kaydet
    if fixed_count > 0:
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(orders, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {fixed_count} order'ın image URL'si 75x75 boyutuna çevrildi!")
        print(f"📄 JSON dosyası güncellendi: {json_file}")
    else:
        print("ℹ️  Düzeltilecek image URL bulunamadı")

if __name__ == "__main__":
    fix_image_urls()
