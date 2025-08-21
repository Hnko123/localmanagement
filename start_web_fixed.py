import subprocess
import sys
import time
import os
import webbrowser

def run_web_server():
    print("🚀 Portable Etsy Manager - Web Sunucu Başlatılıyor...")
    print("-" * 50)
    
    try:
        # Çalışma dizinini ayarla
        os.chdir(r"C:\Users\Hakan\Desktop\gmail\portable_etsy_manager")
        print(f"📁 Çalışma dizini: {os.getcwd()}")
        
        # Gerekli modülleri kontrol et
        print("📦 Modüller kontrol ediliyor...")
        try:
            import uvicorn
            import fastapi
            print("✅ FastAPI ve Uvicorn yüklü")
        except ImportError as e:
            print(f"❌ Gerekli modül bulunamadı: {e}")
            print("Yükleniyor...")
            subprocess.run([sys.executable, "-m", "pip", "install", "fastapi", "uvicorn"])
        
        print("\n🌐 Web sunucu başlatılıyor...")
        print("📍 Adres: http://localhost:8000")
        print("🛑 Durdurmak için Ctrl+C basın\n")
        
        # Tarayıcıyı aç (2 saniye sonra)
        import threading
        def open_browser():
            time.sleep(2)
            webbrowser.open('http://localhost:8000')
        
        threading.Thread(target=open_browser, daemon=True).start()
        
        # Uvicorn sunucusunu başlat
        import uvicorn
        uvicorn.run(
            "app.main:app",
            host="127.0.0.1",
            port=8000,
            reload=False,
            log_level="info"
        )
        
    except KeyboardInterrupt:
        print("\n👋 Sunucu kapatılıyor...")
    except Exception as e:
        print(f"❌ Hata: {e}")
        print("🔧 Sorun giderme:")
        print("1. pip install fastapi uvicorn")
        print("2. Python 3.7+ kullandığınızdan emin olun")
        print("3. Dosya yollarını kontrol edin")
        input("\nEnter tuşuna basın...")

if __name__ == "__main__":
    run_web_server()
