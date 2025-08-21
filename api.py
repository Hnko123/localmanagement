"""
FastAPI backend for Portable Etsy Order Manager.
Provides simple REST endpoints for consuming order data.
"""

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from typing import List

app = FastAPI(title="Portable Etsy Order Manager API")

import os
BASE_DIR = Path(__file__).parent
ORDERS_JSON_SCRIPT = BASE_DIR / "data" / "etsy_orders.json"
ORDERS_JSON_CWD = Path(os.getcwd()) / "portable_etsy_manager" / "data" / "etsy_orders.json"

@app.get("/api/orders", response_model=List[dict])
async def get_orders():
    # Dosya iki farklı yolda aranacak
    print(f"[DEBUG] Orders JSON path (script): {ORDERS_JSON_SCRIPT}")
    print(f"[DEBUG] Orders JSON path (cwd): {ORDERS_JSON_CWD}")
    orders_path = None
    if ORDERS_JSON_SCRIPT.exists():
        orders_path = ORDERS_JSON_SCRIPT
    elif ORDERS_JSON_CWD.exists():
        orders_path = ORDERS_JSON_CWD
    else:
        raise HTTPException(status_code=404, detail=f"Orders file not found: {ORDERS_JSON_SCRIPT} or {ORDERS_JSON_CWD}")
    try:
        with open(orders_path, 'r', encoding='utf-8') as f:
            orders = json.load(f)
        print(f"[DEBUG] Orders loaded: {len(orders)} records from {orders_path}")
        return orders
    except Exception as e:
        print(f"[ERROR] Failed to read orders: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to read orders: {e} (Path: {orders_path})")

@app.get("/api/status")
async def get_status():
    status = {
        "app": "Portable Etsy Order Manager",
        "mode": "test"  # hardcoded for now; could be derived from settings.json
    }
    return status
