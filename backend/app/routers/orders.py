from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload
import stripe

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import CartItem, Order, OrderItem, User
from app.schemas import CheckoutCreatedOut, OrderItemOut, OrderOut

router = APIRouter(prefix="/orders", tags=["Orders & Payments"])


def serialize_order(order: Order) -> OrderOut:
    items = [OrderItemOut(id=item.id, product_id=item.product_id, product_name=item.product_name, image_url=item.image_url, quantity=item.quantity, unit_price_cents=item.unit_price_cents, line_total_cents=item.quantity * item.unit_price_cents) for item in order.items]
    return OrderOut(id=order.id, status=order.status, currency=order.currency, subtotal_cents=order.subtotal_cents, total_cents=order.total_cents, created_at=order.created_at, items=items)


def owned_order(db: Session, order_id: int, user_id: int) -> Order:
    order = db.execute(select(Order).options(joinedload(Order.items)).where(Order.id == order_id, Order.user_id == user_id)).unique().scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=CheckoutCreatedOut, status_code=status.HTTP_201_CREATED)
def create_order(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> CheckoutCreatedOut:
    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env to enable checkout.")

    cart_rows = list(db.scalars(select(CartItem).options(joinedload(CartItem.product)).where(CartItem.user_id == user.id).order_by(CartItem.id)).all())
    if not cart_rows:
        raise HTTPException(status_code=400, detail="Your cart is empty")

    for row in cart_rows:
        if row.quantity > row.product.stock:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {row.product.name}")

    subtotal = sum(row.quantity * row.product.price_cents for row in cart_rows)
    order = Order(user_id=user.id, status="pending", currency=settings.stripe_currency.lower(), subtotal_cents=subtotal, total_cents=subtotal)
    for row in cart_rows:
        order.items.append(OrderItem(product_id=row.product.id, product_name=row.product.name, image_url=row.product.image_url, quantity=row.quantity, unit_price_cents=row.product.price_cents))
    db.add(order)
    db.commit()
    db.refresh(order)

    try:
        stripe.api_key = settings.stripe_secret_key
        payment_intent = stripe.PaymentIntent.create(
            amount=order.total_cents,
            currency=order.currency,
            automatic_payment_methods={"enabled": True},
            metadata={"order_id": str(order.id), "user_id": str(user.id)},
            description=f"StyleHub order #{order.id}",
        )
    except Exception as exc:
        order.status = "failed"
        db.commit()
        raise HTTPException(status_code=502, detail="Stripe could not create the payment. Check your Stripe test keys and currency settings.") from exc

    order.stripe_payment_intent_id = payment_intent.id
    db.query(CartItem).filter(CartItem.user_id == user.id).delete(synchronize_session=False)
    db.commit()
    db.refresh(order)
    if not payment_intent.client_secret:
        raise HTTPException(status_code=502, detail="Stripe did not return a payment client secret")
    return CheckoutCreatedOut(order=serialize_order(order), client_secret=payment_intent.client_secret)


@router.get("", response_model=list[OrderOut])
def list_orders(db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> list[OrderOut]:
    orders = list(db.scalars(select(Order).options(joinedload(Order.items)).where(Order.user_id == user.id).order_by(Order.created_at.desc())).unique().all())
    return [serialize_order(order) for order in orders]


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> OrderOut:
    return serialize_order(owned_order(db, order_id, user.id))



@router.post("/{order_id}/confirm", response_model=OrderOut)
def confirm_order(
    order_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OrderOut:
    order = owned_order(db, order_id, user.id)

    if order.status == "paid":
        return serialize_order(order)

    if not settings.stripe_secret_key:
        raise HTTPException(status_code=503, detail="Stripe is not configured")

    if not order.stripe_payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="This order has no associated PaymentIntent",
        )

    try:
        stripe.api_key = settings.stripe_secret_key
        payment_intent_response = stripe.PaymentIntent.retrieve(
            order.stripe_payment_intent_id
        )
        payment_intent = payment_intent_response.to_dict()
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="Unable to retrieve payment status from Stripe",
        ) from exc

    metadata = payment_intent["metadata"]

    if (
        str(metadata["order_id"]) != str(order.id)
        or str(metadata["user_id"]) != str(user.id)
    ):
        raise HTTPException(
            status_code=400,
            detail="Payment metadata does not match this order",
        )

    if int(payment_intent["amount"]) != order.total_cents:
        raise HTTPException(
            status_code=400,
            detail="Payment amount does not match this order",
        )

    payment_status = payment_intent["status"]

    if payment_status != "succeeded":
        raise HTTPException(
            status_code=409,
            detail=f"Payment is not complete yet (status: {payment_status})",
        )

    order.status = "paid"
    db.commit()
    db.refresh(order)
    return serialize_order(order)
