from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    transaction_id: int
    order_date: str
    status: str = "pending"
    product_name: str
    image_url: str
    material_size: str
    chain_length: str
    personalization: str
    quantity: int
    customer_name: str
    customer_email: str
    customer_address: str
    customer_note: str
    item_price: float
    discount: float
    sales_tax: float
    order_total: float
    shop_name: str
    ioss_number: str
    vat_collected: str
    vat_id: str
    vat_paid_chf: str
    cut: bool = False
    ready: bool = False
    shipped: bool = False
    tracking_number: Optional[str] = None
    shipping_date: Optional[str] = None
    notes: str = ""
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
