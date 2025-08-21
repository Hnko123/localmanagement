# Portable Etsy Order Manager - Kurulum Rehberi

## 📦 Hızlı Başlangıç

### 1. İndirme ve Kurulum
```bash
# Tüm portable_etsy_manager klasörünü istediğiniz yere kopyalayın
cp -r portable_etsy_manager /your/preferred/location/
cd /your/preferred/location/portable_etsy_manager
```

### 2. Gmail Credentials Ayarlama
```bash
# config/gmail_credentials.txt dosyasını düzenleyin
nano config/gmail_credentials.txt
```

Dosya içeriği:
```
your_gmail@gmail.com
your16digitapppassword
```

### 3. Test ve Çalıştırma
```bash
# Sistem testini çalıştırın
python3 test_system.py

# Başarılıysa uygulamayı çalıştırın
./start.sh    # Linux/Mac için
# veya
start.bat     # Windows için
```

## 🔧 Detaylı Kurulum

### Prerequisites (Gereksinimler)

#### Python 3.7+
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip

# macOS (Homebrew)
brew install python3

# Windows
# https://python.org adresinden indirin
```

#### Python Kütüphaneleri
```bash
pip3 install -r requirements.txt
# veya manuel:
pip3 install beautifulsoup4 lxml requests
```

### Gmail App Password Oluşturma

1. **Google Hesap Ayarları**
   - https://myaccount.google.com/security adresine gidin
   - "2-Step Verification" aktif olmalı

2. **App Password Oluşturma**
   - "App passwords" bölümüne gidin
   - "Select app" → "Mail" seçin
   - "Generate" tıklayın
   - 16 haneli şifreyi kopyalayın

3. **Credentials Dosyası**
   ```
   config/gmail_credentials.txt:
   your_email@gmail.com
   abcdefghijklmnop
   ```

### Klasör İzinleri

```bash
# Linux/Mac için executable yapın
chmod +x start.sh
chmod +x test_system.py

# Veri klasörleri için yazma izni
chmod 755 data backup logs
```

## ⚙️ Yapılandırma

### settings.json Ayarları

```json
{
  "processing": {
    "mail_limit": null,        // Sınırsız mail için null
    "use_peek_mode": true,     // Mailleri okundu işaretleme
    "auto_mark_read": false    // Otomatik okundu işaretleme
  },
  "data": {
    "format": ["json", "csv"], // Çıktı formatları
    "backup_enabled": true,    // Otomatik yedekleme
    "compression_enabled": false
  },
  "images": {
    "size_conversion": "250x250", // Resim boyutu
    "fallback_url": "",
    "cache_enabled": false
  }
}
```

### Özel Ayarlar

#### Sadece JSON Çıktısı
```json
"data": {
  "format": ["json"]
}
```

#### Yedeklemeyi Kapatma
```json
"data": {
  "backup_enabled": false
}
```

#### Tüm Mailleri Çekme
```json
"processing": {
  "mail_limit": null
}
```

## 🚚 Taşıma Rehberi

### Bilgisayar Değiştirme

1. **Tüm Klasörü Kopyalama**
   ```bash
   # Kaynak bilgisayar
   tar -czf etsy_manager_backup.tar.gz portable_etsy_manager/
   
   # Hedef bilgisayar
   tar -xzf etsy_manager_backup.tar.gz
   cd portable_etsy_manager
   python3 test_system.py
   ```

2. **Sadece Gerekli Dosyalar**
   ```bash
   # Minimum dosyalar
   portable_etsy_manager/
   ├── portable_etsy_manager.py
   ├── settings.json
   ├── requirements.txt
   └── config/gmail_credentials.txt
   ```

### USB ile Taşıma

```bash
# USB'ye kopyala
cp -r portable_etsy_manager /media/usb/

# Yeni bilgisayarda
cp -r /media/usb/portable_etsy_manager ~/
cd ~/portable_etsy_manager
python3 test_system.py
```

### Sunucu Kurulumu

```bash
# Sunucuya yükle
scp -r portable_etsy_manager user@server:/path/to/
ssh user@server
cd /path/to/portable_etsy_manager

# Cron job ekle (günlük çalıştırma)
crontab -e
# Şu satırı ekleyin:
0 9 * * * cd /path/to/portable_etsy_manager && python3 portable_etsy_manager.py
```

## 🔍 Sorun Giderme

### Yaygın Hatalar

#### "Python bulunamadı"
```bash
# Python yolu kontrol
which python3
# veya
python3 --version

# PATH'e ekle
export PATH=$PATH:/usr/bin/python3
```

#### "Gmail bağlantı hatası"
```bash
# Credentials kontrol
cat config/gmail_credentials.txt

# App password yenile
# Google hesap ayarlarından yeni şifre oluşturun
```

#### "İzin reddedildi"
```bash
# Klasör izinleri
chmod 755 data backup logs
chmod +x *.sh *.py
```

#### "Kütüphane bulunamadı"
```bash
# Kütüphaneleri yeniden yükle
pip3 install --upgrade -r requirements.txt
```

### Log Dosyaları

```bash
# En son log dosyası
tail -f logs/etsy_manager_$(date +%Y%m%d).log

# Tüm loglar
ls -la logs/

# Hata logları
grep ERROR logs/*.log
```

### Debug Modu

```bash
# Verbose çalıştırma
python3 portable_etsy_manager.py --debug

# Test modu (sadece 5 mail)
# settings.json'da "mail_limit": 5
```

## 🔄 Güncelleme

### Yeni Versiyon

```bash
# Sadece ana script güncelle
wget -O portable_etsy_manager.py https://new_version_url

# Veya manuel olarak yeni dosyayı kopyalayın
```

### Ayarları Koruma

```bash
# Önemli dosyaları yedekle
cp config/gmail_credentials.txt ~/backup/
cp settings.json ~/backup/
cp -r data/ ~/backup/

# Güncelleme sonrası geri yükle
cp ~/backup/gmail_credentials.txt config/
cp ~/backup/settings.json .
```

## 📊 Performans Optimizasyonu

### Büyük Veri Setleri

```json
// settings.json
{
  "processing": {
    "mail_limit": 1000,    // Batch processing
    "use_peek_mode": true
  },
  "data": {
    "compression_enabled": true
  }
}
```

### SSD Optimizasyonu

```bash
# Veri klasörünü SSD'ye taşı
mkdir /ssd/etsy_data
ln -s /ssd/etsy_data data
```

## 🔐 Güvenlik

### Credentials Güvenliği

```bash
# Dosya izinlerini sıkılaştır
chmod 600 config/gmail_credentials.txt

# Git'e ekleme
echo "config/gmail_credentials.txt" >> .gitignore
```

### Yedekleme Şifreleme

```bash
# Yedekleri şifrele
tar -czf - data/ | gpg -c > backup_encrypted.tar.gz.gpg

# Şifreli yedekten geri yükle
gpg -d backup_encrypted.tar.gz.gpg | tar -xzf -
```

## 📱 React/Next.js Entegrasyonu

### Veri Kopyalama

```bash
# React projesine JSON kopyala
cp data/etsy_orders.json /path/to/react/public/data/

# Otomatik senkronizasyon
rsync -av data/ /path/to/react/public/data/
```

### API Endpoint

```javascript
// pages/api/etsy-orders.js
export default function handler(req, res) {
  const fs = require('fs');
  const orders = JSON.parse(fs.readFileSync('data/etsy_orders.json'));
  res.json(orders);
}
```

## 🎯 İleri Seviye Kullanım

### Çoklu Gmail Hesabı

```bash
# Farklı credentials ile çoklu çalıştırma
cp -r portable_etsy_manager account2_manager
# account2_manager/config/gmail_credentials.txt'yi düzenle
```

### Webhook Entegrasyonu

```python
# portable_etsy_manager.py sonuna ekle
import requests

def send_webhook(new_orders):
    webhook_url = "https://your-webhook-url.com"
    requests.post(webhook_url, json={"orders": new_orders})
```

---

**Bu rehber ile Portable Etsy Manager'ı herhangi bir sistemde sorunsuz çalıştırabilirsiniz!** 🚀
