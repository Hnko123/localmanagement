import sys
sys.path.append(r'C:\Users\Hakan\\gmail\\portable_etsy_manager')
try:
    from app.main import app
    print('Imported FastAPI app:', app)
except Exception as e:
    print('Import error for app:', e)