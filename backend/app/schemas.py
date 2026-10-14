from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, StringConstraints
from typing import Annotated

Password = Annotated[str, StringConstraints(min_length=8, max_length=72)]


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime


class RegisterIn(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=120)
    password: Password


class LoginIn(BaseModel):
    email: EmailStr
    password: Password


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProductOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    description: str
    category: str
    price_cents: int
    image_url: str
    stock: int
    is_active: bool


class CartItemIn(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(default=1, ge=1, le=99)


class CartQuantityUpdate(BaseModel):
    quantity: int = Field(ge=1, le=99)


class CartLineOut(BaseModel):
    id: int
    quantity: int
    product: ProductOut
    line_total_cents: int


class CartOut(BaseModel):
    items: list[CartLineOut]
    subtotal_cents: int
    item_count: int


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str
    image_url: str
    quantity: int
    unit_price_cents: int
    line_total_cents: int


class OrderOut(BaseModel):
    id: int
    status: str
    currency: str
    subtotal_cents: int
    total_cents: int
    created_at: datetime
    items: list[OrderItemOut]


class CheckoutCreatedOut(BaseModel):
    order: OrderOut
    client_secret: str
