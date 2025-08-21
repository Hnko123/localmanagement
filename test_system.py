#!/usr/bin/env python3
"""
Portable Etsy Manager - Test Script
Test tüm bileşenlerin çalışıp çalışmadığını kontrol eder
"""

import json
import sys
from pathlib import Path

def test_portable_manager():
    """Portable manager'ı test et"""
    print("=== PORTABLE ETSY MANAGER TEST ===")
    print()
    
    app_dir = Path(__file__).parent
    success = True
    
    # 1. Dosya yapısı kontrolü
    print("1. Dosya yapısı kontrol ediliyor...")
    required_files = [
        "settings.json",
        "portable_etsy_manager.py",
        "config/gmail_credentials.txt",
        "README.md",
        "requirements.txt"
    ]
    
    for file_path in required_files:
        full_path = app_dir / file_path
        if full_path.exists():
            print(f"  ✅ {file_path}")
        else:
            print(f"  ❌ {file_path} - EKSIK!")
            success = False
    
    # 2. Klasör yapısı kontrolü
    print("\n2. Klasör yapısı kontrol ediliyor...")
    required_dirs = [
        "config",
        "data", 
        "backup",
        "logs"
    ]
    
    for dir_path in required_dirs:
        full_path = app_dir / dir_path
        if full_path.exists() and full_path.is_dir():
            print(f"  ✅ {dir_path}/")
        else:
            print(f"  ❌ {dir_path}/ - EKSIK!")
            success = False
    
    # 3. Settings.json validasyonu
    print("\n3. Settings.json validasyonu...")
    try:
        with open(app_dir / "settings.json", 'r', encoding='utf-8') as f:
            settings = json.load(f)
        
        required_keys = ["app", "gmail", "processing", "data", "files", "images"]
        for key in required_keys:
            if key in settings:
                print(f"  ✅ {key} section")
            else:
                print(f"  ❌ {key} section - EKSIK!")
                success = False
                
    except Exception as e:
        print(f"  ❌ Settings.json okunamadı: {e}")
        success = False
    
    # 4. Python kütüphaneleri kontrolü
    print("\n4. Python kütüphaneleri kontrol ediliyor...")
    required_modules = [
        "imaplib", "email", "re", "json", "csv", 
        "pathlib", "datetime", "logging", "shutil"
    ]
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"  ✅ {module}")
        except ImportError:
            print(f"  ❌ {module} - EKSIK!")
            success = False
    
    # 5. Opsiyonel kütüphaneler
    print("\n5. Opsiyonel kütüphaneler kontrol ediliyor...")
    optional_modules = ["bs4", "lxml", "requests"]
    
    for module in optional_modules:
        try:
            __import__(module)
            print(f"  ✅ {module}")
        except ImportError:
            print(f"  ⚠️  {module} - Eksik (pip install {module})")
    
    # 6. Credentials kontrolü
    print("\n6. Gmail credentials kontrol ediliyor...")
    cred_file = app_dir / "config/gmail_credentials.txt"
    
    if cred_file.exists():
        try:
            with open(cred_file, 'r') as f:
                lines = f.read().strip().split('\n')
            
            if len(lines) >= 2:
                username = lines[0].strip()
                password = lines[1].strip()
                
                if '@gmail.com' in username:
                    print(f"  ✅ Gmail adresi: {username}")
                else:
                    print(f"  ❌ Geçersiz Gmail adresi: {username}")
                    success = False
                
                if len(password) == 16 and password.isalnum():
                    print(f"  ✅ Uygulama şifresi: {'*' * 16}")
                else:
                    print(f"  ❌ Geçersiz uygulama şifresi (16 karakter olmalı)")
                    success = False
            else:
                print("  ❌ Credentials dosyası eksik bilgi içeriyor")
                success = False
                
        except Exception as e:
            print(f"  ❌ Credentials okunamadı: {e}")
            success = False
    else:
        print("  ❌ Credentials dosyası bulunamadı")
        success = False
    
    # 7. Write permissions
    print("\n7. Yazma izinleri kontrol ediliyor...")
    test_dirs = ["data", "backup", "logs"]
    
    for dir_name in test_dirs:
        dir_path = app_dir / dir_name
        test_file = dir_path / ".test_write"
        
        try:
            with open(test_file, 'w') as f:
                f.write("test")
            test_file.unlink()
            print(f"  ✅ {dir_name}/ yazılabilir")
        except Exception as e:
            print(f"  ❌ {dir_name}/ yazılamıyor: {e}")
            success = False
    
    # Sonuç
    print("\n" + "="*50)
    if success:
        print("🎉 TÜM TESTLER BAŞARILI!")
        print("Portable Etsy Manager çalışmaya hazır.")
        print()
        print("Çalıştırma için:")
        print("  Windows: start.bat")
        print("  Linux/Mac: ./start.sh")
        print("  Manuel: python portable_etsy_manager.py")
    else:
        print("❌ BAZI TESTLER BAŞARISIZ!")
        print("Lütfen eksik dosyaları tamamlayın.")
        print()
        print("Kurulum rehberi için README.md dosyasını inceleyin.")
    
    print("="*50)
    return success

if __name__ == "__main__":
    success = test_portable_manager()
    sys.exit(0 if success else 1)
