#!/bin/bash

# Gmail'den Etsy siparişlerini otomatik çekme scripti
# Bu script Gmail API kullanarak Etsy siparişlerini otomatik olarak çeker

echo "🔄 Gmail'den Etsy sipariş verileri çekiliyor..."

# Gmail sipariş çekme scripti (eski etsy_orders.py kullanarak)
cd "$(dirname "$0")"

# Python virtual environment aktif et
source .venv/Scripts/activate 2>/dev/null || source .venv/bin/activate

# Gmail siparişlerini çek
python etsy_orders.py

# Verileri portable manager'a kopyala
if [ -f "../etsy_data/etsy_orders.json" ]; then
    echo "📥 Veriler portable manager'a kopyalanıyor..."
    cp "../etsy_data/etsy_orders.json" "./data/etsy_orders.json"
    echo "✅ Veriler başarıyla kopyalandı!"
else
    echo "❌ Gmail'den veri çekilemedi!"
fi

echo "🔄 İşlem tamamlandı."
