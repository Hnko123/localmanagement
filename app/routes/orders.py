from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import json
from pathlib import Path

router = APIRouter()

# JSON dosya yolu
DATA_DIR = Path(__file__).parent.parent.parent / "data"
ORDERS_FILE = DATA_DIR / "etsy_orders.json"

# Pydantic models
class FulfillmentUpdate(BaseModel):
    cut: Optional[bool] = None
    ready: Optional[bool] = None
    shipped: Optional[bool] = None

class StatusUpdate(BaseModel):
    status: str

def load_orders():
    # DEBUG: Log the file path that is being read
    print(f"🚀 load_orders() → {ORDERS_FILE}")
    """JSON dosyadan orders yükle"""
    if ORDERS_FILE.exists():
        try:
            with open(ORDERS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                print(f"✅ {len(data)} order yüklendi")
                return data
        except Exception as e:
            print(f"❌ JSON okuma hatası: {e}")
            return []
    else:
        print("❌ JSON dosya yok")
        return []

def save_orders(orders):
    # DEBUG: Log the file path that is being written
    print(f"✅ {len(orders)} order kaydedildi → {ORDERS_FILE}")
    """Orders'ları JSON dosyaya kaydet"""
    try:
        with open(ORDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(orders, f, indent=2, ensure_ascii=False)
        print(f"✅ {len(orders)} order kaydedildi")
        return True
    except Exception as e:
        print(f"❌ JSON kaydetme hatası: {e}")
        return False

def map_order_for_frontend(order):
    """Frontend için order data structure'ını map et"""
    return {
        "transaction_id": order.get("transaction_id"),
        "status": order.get("status", "pending"),
        "product": {
            "name": order.get("product", {}).get("name", ""),
            "quantity": order.get("product", {}).get("quantity", 1)
        },
        "pricing": {
            "order_total": order.get("pricing", {}).get("order_total", 0.0),
            "item_price": order.get("pricing", {}).get("item_price", 0.0),
            "discount": order.get("pricing", {}).get("discount", 0.0),
            "sales_tax": order.get("pricing", {}).get("sales_tax", 0.0)
        },
        "customer": {
            "name": order.get("customer", {}).get("name", ""),
            "email": order.get("customer", {}).get("email", ""),
            "address": order.get("customer", {}).get("address", "")
        },
        "order_date": order.get("order_date", ""),
        "material_size": order.get("product", {}).get("material_size", ""),
        "chain_length": order.get("product", {}).get("chain_length", ""),
        "personalization": order.get("product", {}).get("personalization", ""),
        "customer_note": order.get("customer", {}).get("note", ""),
        "shop_name": order.get("shop", {}).get("name", ""),
        "image_url": order.get("product", {}).get("image_url", ""),  # 75x75 image URL
        "fulfillment": order.get("fulfillment", {
            "cut": False,
            "ready": False, 
            "shipped": False,
            "tracking_number": "",
            "shipping_date": None,
            "notes": ""
        }),
        "problem": order.get("problem", False),
        "important_note": order.get("important_note", "")
    }

@router.get("/orders")
def get_orders(skip: int = 0, limit: int = 100):
    """JSON dosyadan orders listesi döndür"""
    print(f"\n📚 GET /api/orders (skip={skip}, limit={limit})")
    
    try:
        orders = load_orders()
        mapped_orders = [map_order_for_frontend(order) for order in orders]
        
        # Pagination
        start = skip
        end = skip + limit
        result = mapped_orders[start:end]
        
        print(f"✅ {len(result)} order döndürüldü")
        return result
        
    except Exception as e:
        print(f"❌ GET orders error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/orders/{transaction_id}/status")
def update_order_status(transaction_id: int, status_data: StatusUpdate):
    """Order status güncelle"""
    print(f"\n🔄 PATCH /api/orders/{transaction_id}/status -> {status_data.status}")
    
    valid_statuses = ["pending", "cut", "ready", "shipped"]
    if status_data.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    try:
        orders = load_orders()
        order_found = False
        
        # Order bul ve güncelle
        for order in orders:
            if order.get("transaction_id") == transaction_id:
                order["status"] = status_data.status
                order_found = True
                print(f"✅ Order {transaction_id} status -> {status_data.status}")
                break
        
        if not order_found:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Kaydet
        if save_orders(orders):
            return {"transaction_id": transaction_id, "status": status_data.status}
        else:
            raise HTTPException(status_code=500, detail="Failed to save")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Status update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/orders/{transaction_id}/fulfillment")
def update_order_fulfillment(transaction_id: int, fulfillment_data: FulfillmentUpdate):
    """Order fulfillment güncelle (cut, ready, shipped)"""
    print(f"\n📦 PATCH /api/orders/{transaction_id}/fulfillment")
    print(f"   Data: {fulfillment_data.dict(exclude_unset=True)}")
    
    try:
        orders = load_orders()
        order_found = False
        
        # Order bul ve güncelle
        for order in orders:
            if order.get("transaction_id") == transaction_id:
                if "fulfillment" not in order:
                    order["fulfillment"] = {}
                
                # Sadece gönderilen field'ları güncelle
                update_data = fulfillment_data.dict(exclude_unset=True)
                for key, value in update_data.items():
                    order["fulfillment"][key] = value
                    print(f"   ✅ {key} -> {value}")
                
                order_found = True
                break
        
        if not order_found:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Kaydet
        if save_orders(orders):
            return {
                "transaction_id": transaction_id, 
                "fulfillment": order["fulfillment"]
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Fulfillment update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/orders/{transaction_id}")
def update_full_order(transaction_id: int, order_data: dict):
    """Order'ın tüm bilgilerini güncelle"""
    print(f"\n🔄 PUT /api/orders/{transaction_id}")
    
    try:
        orders = load_orders()
        order_found = False
        
        # Order bul ve güncelle
        for i, order in enumerate(orders):
            if order.get("transaction_id") == transaction_id:
                # Mevcut order'ı yeni data ile güncelle
                orders[i] = {**order, **order_data}
                order_found = True
                print(f"✅ Order {transaction_id} fully updated")
                break
        
        if not order_found:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Kaydet
        if save_orders(orders):
            return {"transaction_id": transaction_id, "message": "Order updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to save")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Full order update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orders/{transaction_id}")
def get_single_order(transaction_id: int):
    """Tek order getir"""
    print(f"\n📄 GET /api/orders/{transaction_id}")
    
    try:
        orders = load_orders()
        
        for order in orders:
            if order.get("transaction_id") == transaction_id:
                mapped_order = map_order_for_frontend(order)
                print(f"✅ Order {transaction_id} found")
                return mapped_order
        
        raise HTTPException(status_code=404, detail="Order not found")
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Get single order error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
