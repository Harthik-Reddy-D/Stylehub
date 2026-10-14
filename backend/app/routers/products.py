from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductOut

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=list[ProductOut])
def list_products(q: str | None = None, category: str | None = None, db: Session = Depends(get_db)) -> list[Product]:
    stmt = select(Product).where(Product.is_active.is_(True))
    if q and q.strip():
        term = f"%{q.strip()}%"
        stmt = stmt.where((Product.name.ilike(term)) | (Product.description.ilike(term)))
    if category and category.lower() != "all":
        stmt = stmt.where(Product.category.ilike(category.strip()))
    return list(db.scalars(stmt.order_by(Product.id)).all())


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> Product:
    product = db.scalar(select(Product).where(Product.id == product_id, Product.is_active.is_(True)))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product
