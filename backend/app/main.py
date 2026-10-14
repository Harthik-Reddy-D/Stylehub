from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, SessionLocal, engine
from app import models  # noqa: F401 - registers SQLAlchemy models
from app.seed import seed_products
from app.routers import auth, cart, orders, products


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_products(db)
    yield


app = FastAPI(
    title="StyleHub API",
    description="API for the StyleHub Fashion Mini Store",
    version="1.0.0",
    lifespan=lifespan,
)

origins = list({settings.frontend_origin, "http://localhost:5173", "http://127.0.0.1:5173"})
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(orders.router)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok", "app": "StyleHub API"}
