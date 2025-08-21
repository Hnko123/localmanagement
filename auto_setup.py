#!/usr/bin/env python3
"""
Portable Etsy Manager - Auto Setup
Mevcut Gmail credentials'ını otomatik portable sisteme kopyalar
"""

import shutil
from pathlib import Path
import json

def auto_setup_credentials():
    """Mevcut credentials'ı portable sisteme kopyala"""
    print("=== PORTABLE ETSY MANAGER - AUTO SETUP ===")
    print()
    
    # Paths
    main_dir = Path(__file__).parent.parent
    portable_dir = Path(__file__).parent
    
    # Mevcut credentials dosyalarını ara
    possible_credential_files = [
        main_dir / "gmail_credentials.txt",
        main_dir / "config" / "gmail_credentials.txt", 
        main_dir / "credentials.txt",
        main_dir / "google uygulama şifresi.txt"
    ]
    
    source_file = None
    for file_path in possible_credential_files:
        if file_path.exists():
            source_file = file_path
            print(f"✅ Mevcut credentials bulundu: {file_path}")
            break
    
    if not source_file:
        print("❌ Mevcut credentials dosyası bulunamadı!")
        print("Lütfen aşağıdaki dosyalardan birini oluşturun:")
        for file_path in possible_credential_files:
            print(f"  - {file_path}")
        return False
    
    # Portable credentials path
    portable_credentials = portable_dir / "config" / "gmail_credentials.txt"
    portable_credentials.parent.mkdir(exist_ok=True)
    
    # Dosyayı kopyala
    try:
        shutil.copy2(source_file, portable_credentials)
        print(f"✅ Credentials kopyalandı: {portable_credentials}")
        
        # İçeriği doğrula
        with open(portable_credentials, 'r', encoding='utf-8') as f:
            lines = f.read().strip().split('\n')
        
        if len(lines) >= 2:
            username = lines[0].strip()
            password = lines[1].strip()
            
            if '@gmail.com' in username and len(password) == 16:
                print(f"✅ Gmail: {username}")
                print(f"✅ App Password: {'*' * 16}")
                return True
            else:
                print("❌ Credentials formatı geçersiz!")
                return False
        else:
            print("❌ Credentials dosyası eksik bilgi içeriyor!")
            return False
            
    except Exception as e:
        print(f"❌ Credentials kopyalanamadı: {e}")
        return False

def setup_default_settings():
    """Default ayarları optimize et"""
    settings_file = Path(__file__).parent / "settings.json"
    
    try:
        with open(settings_file, 'r', encoding='utf-8') as f:
            settings = json.load(f)
        
        # Kullanıcı dostu ayarlar
        settings["processing"]["mail_limit"] = 50  # Güvenli başlangıç
        settings["processing"]["use_peek_mode"] = True  # Mailleri bozma
        settings["data"]["backup_enabled"] = True  # Güvenlik
        
        with open(settings_file, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=2, ensure_ascii=False)
        
        print("✅ Ayarlar optimize edildi")
        return True
        
    except Exception as e:
        print(f"❌ Ayarlar güncellenemedi: {e}")
        return False

def create_quick_start():
    """Hızlı başlangıç scripti oluştur"""
    
    # Windows için
    batch_content = '''@echo off
echo === PORTABLE ETSY MANAGER - HAZIR SISTEM ===
echo.
echo Credentials otomatik yuklendi, hemen calistirilabilir!
echo.

cd /d "%~dp0"

echo Python kontrol ediliyor...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo HATA: Python bulunamadi!
    echo Python 3.7+ yukleyip PATH'e ekleyin
    pause
    exit /b 1
)

echo.
echo Gerekli kutuphaneler kontrol ediliyor...
python -c "import bs4" >nul 2>&1
if %errorlevel% neq 0 (
    echo BeautifulSoup4 yukleniyor...
    pip install beautifulsoup4 lxml
)

echo.
echo === CREDENTIALS HAZIR - DIREKT CALISTIRILIYOR ===
python portable_etsy_manager.py

echo.
if exist "data\\etsy_orders.json" (
    echo BASARILI! JSON dosyasi olusturuldu
    echo React/Next.js icin hazir: data\\etsy_orders.json
    start data
) else (
    echo Veri dosyasi olusturulamadi - loglari kontrol edin
    if exist "logs\\*.log" (
        echo Son log dosyasi:
        for %%f in (logs\\*.log) do echo %%f
    )
)

pause
'''
    
    quick_start_file = Path(__file__).parent / "quick_start.bat"
    with open(quick_start_file, 'w', encoding='utf-8') as f:
        f.write(batch_content)
    
    print(f"✅ Hızlı başlangıç scripti oluşturuldu: {quick_start_file}")

def main():
    """Ana setup fonksiyonu"""
    success = True
    
    print("1. Credentials otomatik kopyalama...")
    if not auto_setup_credentials():
        success = False
    
    print("\n2. Ayarlar optimize ediliyor...")
    if not setup_default_settings():
        success = False
    
    print("\n3. Hızlı başlangıç scripti oluşturuluyor...")
    create_quick_start()
    
    print("\n" + "="*50)
    if success:
        print("🎉 AUTO SETUP BAŞARILI!")
        print()
        print("Portable Etsy Manager kullanıma hazır:")
        print("  • Gmail credentials otomatik yüklendi")
        print("  • Güvenli ayarlar yapıldı") 
        print("  • Hızlı başlangıç scripti hazır")
        print()
        print("ÇALIŞTIRMAK İÇİN:")
        print("  Windows: quick_start.bat")
        print("  Linux/Mac: ./start.sh")
        print("  Manuel: python portable_etsy_manager.py")
        print()
        print("İLK ÇALIŞTIRMADA:")
        print("  • 50 mail test modu aktif")
        print("  • Otomatik yedekleme açık")
        print("  • JSON + CSV çıktısı")
    else:
        print("❌ AUTO SETUP HATALI!")
        print("Manuel kurulum gerekebilir.")
    
    print("="*50)
    return success

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)
