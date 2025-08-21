import sys
sys.path.append(r'C:\Users\Hakan\Desktop\gmail\portable_etsy_manager')
print('Sys path:', sys.path)
try:
    import app.orders
    print('Imported orders module OK')
except Exception as e:
    print('Import error:', e)