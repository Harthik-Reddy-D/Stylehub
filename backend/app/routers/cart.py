from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user
from app.models import CartItem, Product, User
from app.schemas import CartItemIn, CartLineOut, CartOut, CartQuantityUpdate, ProductOut

router = APIRouter(prefix="/cart", tags=["Cart"])


def serialize_cart(db: Session, user_id: int) -> CartOut:
    rows = list(db.scalars(select(CartItem).options(joinedload(CartItem.product)).where(CartItem.user_id == user_id).order_by(CartItem.id)).all())
    lines = [CartLineOut(id=row.id, quantity=row.quantity, product=ProductOut.model_validate(row.product), line_total_cents=row.quantity * row.product.price_cents) for row in rows]
    return CartOut(items=lines, subtotal_cents=sum(line.line_total_cents for line in lines), item_count=sum(line.quantity for line in lines))


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> CartOut:
    return serialize_cart(db, user.id)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_200_OK)
def add_cart_item(payload: CartItemIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> CartOut:
    product = db.scalar(select(Product).where(Product.id == payload.product_id, Product.is_active.is_(True)))
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    existing = db.scalar(select(CartItem).where(CartItem.user_id == user.id, CartItem.product_id == product.id))
    new_quantity = (existing.quantity if existing else 0) + payload.quantity
    if new_quantity > product.stock:
        raise HTTPException(status_code=400, detail=f"Only {product.stock} item(s) are available")
    if existing:
        existing.quantity = new_quantity
    else:
        db.add(CartItem(user_id=user.id, product_id=product.id, quantity=payload.quantity))
    db.commit()
    return serialize_cart(db, user.id)


@router.patch("/items/{item_id}", response_model=CartOut)
def update_cart_item(item_id: int, payload: CartQuantityUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> CartOut:
    item = db.scalar(select(CartItem).options(joinedload(CartItem.product)).where(CartItem.id == item_id, CartItem.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    if payload.quantity > item.product.stock:
        raise HTTPException(status_code=400, detail=f"Only {item.product.stock} item(s) are available")
    item.quantity = payload.quantity
    db.commit()
    return serialize_cart(db, user.id)


@router.delete("/items/{item_id}", response_model=CartOut)
def remove_cart_item(item_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> CartOut:
    item = db.scalar(select(CartItem).where(CartItem.id == item_id, CartItem.user_id == user.id))
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
    return serialize_cart(db, user.id)
