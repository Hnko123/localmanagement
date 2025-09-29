import subprocess
import sys
import time
import os

def run_web_server():
    print("🚀 Portable Etsy Manager - Web Sunucu Başlatılıyor...")
    print("-" * 50)
    
    try:
        # Çalışma dizinini kontrol et
        os.chdir(r"C:\Users\Hakan\Desktop\gmail\portable_etsy_manager")
        print(f"📁 Çalışma dizini: {os.getcwd()}")
        
        # Gerekli modülleri kontrol et
        print("📦 Modüller kontrol ediliyor...")
        import uvicorn
        from app.main import app
        print("✅ Tüm modüller yüklü")
        
        print("\n🌐 Web sunucu başlatılıyor...")
        print("📍 Adres: http://localhost:8080")
        print("🛑 Durdurmak için Ctrl+C basın\n")
        
        # Tarayıcıyı aç
        subprocess.Popen(['start', 'http://localhost:8080'], shell=True)
        
        # Uvicorn sunucusunu başlat
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8080,
            reload=True,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 Sunucu kapatılıyor...")
    except Exception as e:
        print(f"❌ Hata: {e}")
        print("🔧 Sorun giderme:")
        print("1. pip install uvicorn fastapi jinja2")
        print("2. Python 3.7+ kullandığınızdan emin olun")
        input("Enter tuşuna basın...")

if __name__ == "__main__":
    run_web_server()
