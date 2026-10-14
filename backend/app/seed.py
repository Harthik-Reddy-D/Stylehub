from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Product

PRODUCTS = [
    {"name": "Everyday Oversized Tee", "description": "A soft, relaxed-fit cotton tee designed for everyday layering.", "category": "Clothing", "price_cents": 79900, "image_url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85", "stock": 40},
    {"name": "Classic Denim Jacket", "description": "A timeless denim layer with a comfortable fit and durable finish.", "category": "Clothing", "price_cents": 249900, "image_url": "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85", "stock": 18},
    {"name": "Linen Weekend Shirt", "description": "Breathable linen-blend shirt for warm days and easy weekends.", "category": "Clothing", "price_cents": 169900, "image_url": "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85", "stock": 22},
    {"name": "Minimal White Sneakers", "description": "Clean low-top sneakers that pair with almost anything.", "category": "Footwear", "price_cents": 219900, "image_url": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85", "stock": 20},
    {"name": "Urban Running Sneakers", "description": "Lightweight everyday trainers with a cushioned, flexible sole.", "category": "Footwear", "price_cents": 289900, "image_url": "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=85", "stock": 14},
    {"name": "Canvas Crossbody Bag", "description": "A compact crossbody bag with practical pockets for daily essentials.", "category": "Bags", "price_cents": 119900, "image_url": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85", "stock": 25},
    {"name": "Structured Tote Bag", "description": "A roomy structured tote for work, study, and weekends.", "category": "Bags", "price_cents": 189900, "image_url": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85", "stock": 16},
    {"name": "Everyday Baseball Cap", "description": "An adjustable cap with a curved brim and understated branding.", "category": "Accessories", "price_cents": 59900, "image_url": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=900&q=85", "stock": 30},
    {"name": "Classic Analog Watch", "description": "A minimalist watch with a clean dial and versatile strap.", "category": "Accessories", "price_cents": 329900, "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85", "stock": 10},
    {"name": "Soft Knit Sweater", "description": "A versatile knit layer with a soft hand feel and relaxed silhouette.", "category": "Clothing", "price_cents": 199900, "image_url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=85", "stock": 17},
    {"name": "Everyday Sunglasses", "description": "Simple frame sunglasses for a polished, casual finish.", "category": "Accessories", "price_cents": 89900, "image_url": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85", "stock": 28},
    {"name": "Weekend Slides", "description": "Comfortable easy-on slides for travel and relaxed days.", "category": "Footwear", "price_cents": 99900, "image_url": "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=900&q=85", "stock": 24},
]


def seed_products(db: Session) -> None:
    exists = db.scalar(select(Product.id).limit(1))
    if exists:
        return
    db.add_all(Product(**product) for product in PRODUCTS)
    db.commit()
