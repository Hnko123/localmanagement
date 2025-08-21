import sys
sys.path.append(r'C:\Users\Hakan\Desktop\gmail\portable_etsy_manager')
from app.orders import load_orders, save_orders
orders = load_orders()
print('Orders loaded:', len(orders))
if orders:
    orders[0]['status'] = 'completed'
    success = save_orders(orders)
    print('Saved:', success)
else:
    print('No orders')