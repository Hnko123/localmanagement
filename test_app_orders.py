import sys
sys.path.append(r'C:\Users\Hakan\Desktop\\gmail\\portable_etsy_manager')
try:
    import app.orders
    print('Imported orders:', app.orders)
except Exception as e:
    print('Import error for orders:', e)