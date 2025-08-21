import sys
sys.path.append(r'C:\Users\Hakan\Desktop\gmail\portable_etsy_manager')
try:
    import app
    print('Imported app:', app)
except Exception as e:
    print('Import error for app:', e)