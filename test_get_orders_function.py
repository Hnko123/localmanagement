import sys
sys.path.append(r'C:\Users\Hakan\\gmail\\portable_etsy_manager')
from app.routes.orders import get_orders
orders = get_orders()
print('Orders returned:', len(orders))
print('First order sample:', orders[0] if orders else None)