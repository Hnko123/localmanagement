# 🚀 Portable Etsy Manager - Modern UI

## 📋 Uygulama Özellikleri

### ✨ Modern 3D Kanban Arayüzü
- **3D Order Cards**: Her sipariş 3D kart olarak görüntülenir
- **Drag & Drop**: Siparişleri sürükleyip bırakarak durum değiştirme
- **Gradient Design**: Modern gradient arka plan ve renkli sütunlar
- **Real-time Updates**: Anlık güncelleme ve senkronizasyon

### 🎯 Sipariş Durumları
- ⏳ **Pending**: Bekleyen siparişler
- ✂️ **Cut**: Kesim aşamasında
- 📦 **Ready to Ship**: Gönderime hazır
- 🚚 **Shipped**: Gönderildi

### 🔧 Teknik Özellikler
- **React 18** + **Vite** build sistemi
- **@react-three/fiber** 3D rendering
- **react-beautiful-dnd** drag & drop
- **styled-components** modern styling
- **FastAPI** backend API
- **SQLite** database

## 🚀 Hızlı Başlangıç

### 1. Modern UI Başlatma
```bash
# Modern arayüzü başlat
BASLA_MODERN.bat
```

### 2. Manuel Başlatma
```bash
# Exe dosyasını çalıştır
portable_etsy_manager_modern.exe

# Tarayıcıda aç
http://localhost:3000
```

## 📁 Dosya Yapısı

```
portable_etsy_manager/
├── portable_etsy_manager_modern.exe    # Modern UI exe
├── BASLA_MODERN.bat                    # Başlatma script'i
├── app/
│   ├── main.py                         # FastAPI backend
│   └── static/                         # React build dosyaları
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Ana React component
│   │   └── components/
│   │       ├── KanbanBoard.jsx         # Kanban board
│   │       └── OrderCard3D.jsx         # 3D order card
│   └── package.json                    # Frontend dependencies
└── data/
    └── etsy_orders.json                # Sipariş verileri
```

## 🎨 3D Effects Özellikleri

### OrderCard3D Component
- **3D Box**: Her kart 3D kutu olarak render edilir
- **Hover Effects**: Mouse üzerine gelince döner ve renk değiştirir
- **Auto Rotation**: Hover durumunda otomatik döner
- **Text Rendering**: 3D text ile ürün adı ve fiyat
- **Quantity Badge**: Yeşil badge ile miktar gösterimi

### KanbanBoard Component
- **Gradient Background**: Mor-mavi gradient arka plan
- **Glassmorphism**: Şeffaf cam efekti sütunlar
- **Color-coded Columns**: Her durum için farklı renk
- **Smooth Animations**: Yumuşak geçiş animasyonları

## 🔄 API Endpoints

### GET /api/orders
Siparişleri frontend formatında döndürür:
```json
{
  "transaction_id": 123456,
  "status": "pending",
  "product": {
    "name": "14K Gold Necklace",
    "quantity": 1
  },
  "pricing": {
    "order_total": 299.99
  },
  "customer": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### PATCH /api/orders/{transaction_id}/status
Sipariş durumunu günceller:
```json
{
  "status": "ready"
}
```

## 🛠️ Geliştirme

### Frontend Build
```bash
cd frontend
npm install --legacy-peer-deps
npm run build
```

### Backend Development
```bash
# Virtual environment aktif et
.\.venv\Scripts\Activate.ps1

# FastAPI development server
python -m uvicorn app.main:app --reload
```

### Data Sync
```bash
# JSON'dan database'e
python sync_data.py

# Database'den JSON'a
python sync_data.py reverse
```

## 🎯 Kullanım Senaryoları

### 1. Sipariş Yönetimi
- Siparişleri durumlarına göre görüntüle
- Drag & drop ile durum değiştir
- 3D kartlarda detayları incele

### 2. Workflow Takibi
- Pending → Cut → Ready → Shipped
- Her aşamada görsel feedback
- Renk kodlu durum takibi

### 3. Müşteri Bilgileri
- Müşteri adı ve email
- Sipariş detayları
- Fiyat bilgileri

## 🔧 Sorun Giderme

### Exe Çalışmıyor
1. Port 3000'in boş olduğundan emin ol
2. Antivirus programını kontrol et
3. Windows Defender'ı geçici olarak kapat

### 3D Effects Görünmüyor
1. WebGL desteğini kontrol et
2. Tarayıcıyı güncelle
3. Hardware acceleration'ı aç

### API Bağlantı Hatası
1. Exe dosyasının çalıştığından emin ol
2. `http://localhost:3000/api/orders` endpoint'ini test et
3. Console'da hata mesajlarını kontrol et

## 🎉 Sonuç

Bu modern UI uygulaması ile:
- ✅ Gmail'den Etsy siparişlerini çek
- ✅ 3D Kanban board'da görüntüle
- ✅ Drag & drop ile yönet
- ✅ Modern arayüz deneyimi yaşa

**Portable Etsy Manager Modern UI** - Etsy sipariş yönetiminde yeni nesil deneyim! 🚀
