# 🎉 Portable Etsy Manager - Kurulum Tamamlandı!

## ✅ Yapılan İşlemler

### 1. Python Kurulumu ve Sanal Ortam
- ✅ Python 3.13.3 tespit edildi
- ✅ Sanal ortam (.venv) oluşturuldu
- ✅ Tüm gerekli kütüphaneler yüklendi

### 2. Gmail Credentials
- ✅ Mevcut Gmail credentials otomatik kopyalandı
- ✅ `config/gmail_credentials.txt` dosyası oluşturuldu
- ✅ Gmail hesabı: `etsyortakk@gmail.com`

### 3. Sistem Testleri
- ✅ Tüm dosya yapısı kontrol edildi
- ✅ Python kütüphaneleri doğrulandı
- ✅ Gmail bağlantısı test edildi
- ✅ Yazma izinleri kontrol edildi

### 4. İlk Çalıştırma Testi
- ✅ 1840 Etsy maili bulundu
- ✅ 50 mail test modunda işlendi
- ✅ 47 yeni sipariş çıkarıldı
- ✅ JSON ve CSV dosyaları oluşturuldu
- ✅ Otomatik yedekleme yapıldı

## 🚀 Uygulamayı Çalıştırma

### Seçenek 1: PowerShell Script (Önerilen)
```powershell
.\start_app.ps1
```

### Seçenek 2: Batch Dosyası
```cmd
start_app.bat
```

### Seçenek 3: Manuel Çalıştırma
```powershell
# Sanal ortamı aktif et
.\.venv\Scripts\Activate.ps1

# Uygulamayı çalıştır
python portable_etsy_manager.py
```

## 📁 Oluşturulan Dosyalar

### Veri Dosyaları
- `data/etsy_orders.json` - Tüm siparişler (JSON format)
- `data/etsy_orders.csv` - Tüm siparişler (CSV format)
- `data/processed_transaction_ids.json` - İşlenmiş sipariş ID'leri

### Yedek Dosyaları
- `backup/20250820_073158/` - Otomatik yedekleme

### Başlatma Scriptleri
- `start_app.ps1` - PowerShell başlatma scripti
- `start_app.bat` - Windows batch başlatma scripti

## ⚙️ Ayarlar

### Mevcut Ayarlar (settings.json)
```json
{
  "processing": {
    "mail_limit": 50,        // Test modu - tüm mailler için null yapın
    "use_peek_mode": true,   // Mailleri bozmadan oku
    "auto_mark_read": false  // Otomatik okundu işaretleme
  },
  "data": {
    "format": ["json", "csv"], // Çıktı formatları
    "backup_enabled": true,    // Otomatik yedekleme
    "compression_enabled": false
  }
}
```

### Tüm Mailleri İşlemek İçin
`settings.json` dosyasında `"mail_limit": null` yapın.

## 🔧 Sorun Giderme

### Sanal Ortam Aktif Değilse
```powershell
.\.venv\Scripts\Activate.ps1
```

### Python Bulunamazsa
```powershell
& "C:\Program Files\Python313\python.exe" portable_etsy_manager.py
```

### Gmail Bağlantı Hatası
- `config/gmail_credentials.txt` dosyasını kontrol edin
- Google App Password'in geçerli olduğundan emin olun

## 📊 Sonuçlar

### İlk Test Çalıştırması
- ✅ 1840 Etsy maili tespit edildi
- ✅ 50 mail işlendi (test modu)
- ✅ 47 yeni sipariş çıkarıldı
- ✅ Tüm veriler JSON ve CSV formatında kaydedildi
- ✅ Otomatik yedekleme oluşturuldu

## 🎯 Sonraki Adımlar

1. **Tüm Mailleri İşlemek**: `settings.json`'da `"mail_limit": null` yapın
2. **Düzenli Çalıştırma**: Windows Task Scheduler ile otomatik çalıştırın
3. **Veri Analizi**: Oluşturulan JSON/CSV dosyalarını Excel'de açın
4. **Yedekleme**: Düzenli olarak `backup/` klasörünü yedekleyin

## 📞 Destek

Herhangi bir sorun yaşarsanız:
1. `test_system.py` çalıştırarak sistem durumunu kontrol edin
2. `logs/` klasöründeki log dosyalarını inceleyin
3. Gmail credentials'ını yeniden kontrol edin

---

**🎉 Portable Etsy Manager başarıyla kuruldu ve çalışmaya hazır!**
