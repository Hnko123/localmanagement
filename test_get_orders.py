import sys
sys.path.append(r'C:\Users\Hakan\\gmail\\portable_etsy_manager')
from app.routes.orders_router import get_orders, get_order_by_id
# Get all orders
orders = get_orders()
print('Total orders:', len(orders))
if orders:
    print('First order id:', orders[0]['transaction_id'])
    # Get by ID
    first_id = orders[0]['transaction_id']
    order = get_order_by_id(first_id)
    print('Retrieved order:', order)
