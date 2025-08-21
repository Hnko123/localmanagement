import sys
sys.path.append(r'C:\Users\Hakan\Desktop\\gmail\\portable_etsy_manager')
from app.orders import load_orders, save_orders
orders = load_orders()
print('Orders loaded:', len(orders))
# modify first order if exists
if orders:
    orders[0]['status'] = 'completed'
    success = save_orders(orders)
    print('Saved:', success)
else:
    # create dummy order
    orders.append({'transaction_id':123,'status':'pending'})
    success=save_orders(orders)
    print('Created and saved new order, success:', success)
# reload to verify
orders2 = load_orders()
print('Reloaded orders length:', len(orders2))
print('First order status:', orders2[0].get('status'))