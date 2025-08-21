#!/bin/bash
# Portable Etsy Manager - Linux/Mac için başlatıcı

echo "=== PORTABLE ETSY MANAGER (Linux/Mac) ==="
echo

# Script dizinine git
cd "$(dirname "$0")"

echo "Çalışma dizini: $(pwd)"
echo

# Python kontrol
if ! command -v python3 &> /dev/null; then
    echo "HATA: Python3 bulunamadı!"
    echo "Lütfen Python 3.7+ yükleyin"
    exit 1
fi

echo "Python versiyonu:"
python3 --version
echo

# Gerekli kütüphaneler
echo "Python kütüphaneleri kontrol ediliyor..."
python3 -c "import imaplib, email, json, csv, pathlib, bs4, re, datetime" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Bazı kütüphaneler eksik, yükleniyor..."
    pip3 install beautifulsoup4 lxml
fi

# Dosya kontrolü
if [ ! -f "settings.json" ]; then
    echo "HATA: settings.json bulunamadı!"
    exit 1
fi

if [ ! -f "config/gmail_credentials.txt" ]; then
    echo "HATA: Gmail credentials bulunamadı!"
    echo "Lütfen config/gmail_credentials.txt dosyasını oluşturun"
    echo "Satır 1: Gmail adresi"
    echo "Satır 2: 16 haneli uygulama şifresi"
    exit 1
fi

echo "Klasör yapısı:"
find . -type f -name "*.py" -o -name "*.json" -o -name "*.txt" | head -10

echo
echo "=== PORTABLE ETSY MANAGER ÇALIŞTIRILIYOR ==="
echo

python3 portable_etsy_manager.py

echo
echo "=== İŞLEM TAMAMLANDI ==="

if [ -f "data/etsy_orders.json" ]; then
    echo "BAŞARILI! Veriler hazır:"
    echo
    echo "DOSYALAR:"
    ls -la data/
    echo
    echo "JSON dosya boyutu:"
    ls -lh data/etsy_orders.json
    echo
    echo "Veri klasörünü açıyor..."
    if command -v open &> /dev/null; then
        open data  # macOS
    elif command -v xdg-open &> /dev/null; then
        xdg-open data  # Linux
    fi
else
    echo "Veri dosyaları oluşturulamadı"
fi

echo
echo "REACT/NEXT.JS UYGULAMA İÇİN HAZIR!"
echo "JSON dosyasını React projenize kopyalayabilirsiniz"
echo

read -p "Çıkmak için Enter'a basın..."
