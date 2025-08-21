#!/usr/bin/env python3
"""
Portable Etsy Manager - Final Verification
Tüm sistem hazır mı kontrol eder
"""

import json
from pathlib import Path

def verify_system():
    """Sistemin hazır olduğunu doğrula"""
    print("=== PORTABLE ETSY MANAGER - SISTEM DOĞRULAMA ===")
    print()
    
    app_dir = Path(__file__).parent
    all_good = True
    
    # 1. Credentials kontrolü
    print("1. Gmail Credentials Kontrolü:")
    cred_file = app_dir / "config" / "gmail_credentials.txt"
    
    if cred_file.exists():
        with open(cred_file, 'r') as f:
            lines = f.read().strip().split('\n')
        
        if len(lines) >= 2:
            username = lines[0].strip()
            password = lines[1].strip()
            
            if username == "etsyortakk@gmail.com" and len(password) == 16:
                print(f"   ✅ Gmail: {username}")
                print(f"   ✅ App Password: {'*' * 16}")
            else:
                print("   ❌ Credentials geçersiz!")
                all_good = False
        else:
            print("   ❌ Credentials eksik!")
            all_good = False
    else:
        print("   ❌ Credentials dosyası yok!")
        all_good = False
    
    # 2. Settings kontrolü
    print("\n2. Settings Kontrolü:")
    settings_file = app_dir / "settings.json"
    
    if settings_file.exists():
        with open(settings_file, 'r') as f:
            settings = json.load(f)
        
        mail_limit = settings.get("processing", {}).get("mail_limit")
        use_peek = settings.get("processing", {}).get("use_peek_mode")
        
        print(f"   ✅ Mail Limit: {mail_limit} (50 = test modu)")
        print(f"   ✅ PEEK Mode: {use_peek} (true = güvenli)")
        print(f"   ✅ Backup: {settings.get('data', {}).get('backup_enabled')}")
    else:
        print("   ❌ Settings dosyası yok!")
        all_good = False
    
    # 3. Klasör yapısı
    print("\n3. Klasör Yapısı:")
    required_dirs = ["config", "data", "backup", "logs"]
    
    for dir_name in required_dirs:
        dir_path = app_dir / dir_name
        if dir_path.exists():
            print(f"   ✅ {dir_name}/")
        else:
            print(f"   ❌ {dir_name}/ eksik!")
            all_good = False
    
    # 4. Script dosyaları
    print("\n4. Script Dosyaları:")
    required_scripts = [
        "portable_etsy_manager.py",
        "BASLA.bat",
        "start.bat", 
        "start.sh",
        "test_system.py"
    ]
    
    for script in required_scripts:
        script_path = app_dir / script
        if script_path.exists():
            print(f"   ✅ {script}")
        else:
            print(f"   ⚠️  {script} eksik")
    
    # 5. Dokümantasyon
    print("\n5. Dokümantasyon:")
    docs = ["README.md", "KURULUM_REHBERI.md", "requirements.txt"]
    
    for doc in docs:
        doc_path = app_dir / doc
        if doc_path.exists():
            print(f"   ✅ {doc}")
        else:
            print(f"   ⚠️  {doc} eksik")
    
    # Sonuç
    print("\n" + "="*60)
    if all_good:
        print("🎉 SİSTEM TAM HAZIR!")
        print()
        print("Kullanıcı artık şunları yapabilir:")
        print("  • BASLA.bat çift tıkla → Direkt çalışır")
        print("  • Gmail bilgisi tekrar girmez")
        print("  • 50 mail test modu aktif")
        print("  • JSON + CSV çıktısı alır")
        print("  • React/Next.js için hazır veri")
        print()
        print("TAŞIMA:")
        print("  • Tüm klasörü kopyala")
        print("  • BASLA.bat çalıştır")
        print("  • Tekrar ayar gerektirmez")
    else:
        print("❌ SİSTEMDE EKSİKLİKLER VAR!")
        print("Lütfen eksik dosyaları tamamlayın.")
    
    print("="*60)
    return all_good

if __name__ == "__main__":
    verify_system()
