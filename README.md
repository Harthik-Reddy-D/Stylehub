# StyleHub — Fashion Mini Store

A local full-stack fashion store built with **FastAPI + SQLAlchemy + SQLite** and **React + Vite + Tailwind CSS**. This project is configured to work with Python 3.14.x and Node.js 24.x. Docker is intentionally not included.

## Features

- Register, log in, and view the current user (JWT authentication; bcrypt password hashing).
- 12 seeded fashion products with search and category filters.
- A per-user shopping cart with quantity updates and server-side price calculations.
- Order history and order details.
- Stripe PaymentIntents using Stripe Elements; the backend confirms a payment by retrieving the PaymentIntent, so **Stripe CLI/webhooks are not required** for the normal card-payment flow.
- Swagger API documentation at `/docs`.
- SQLite database created automatically at `backend/stylehub.db` on first backend start.

## Requirements

- Windows 11 (instructions below use PowerShell)
- Python 3.14.x, 64-bit
- Node.js 24.x and npm
- A Stripe account and test-mode API keys to test checkout. Product browsing/cart/auth work without Stripe keys; checkout requires them.

## 1. Configure the backend

Open VS Code in the extracted `stylehub` folder. Open a terminal and run:

```powershell
Copy-Item backend/.env.example backend/.env
cd backend
py -3.14 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r requirements.txt
uvicorn app.main:app --reload
```

If PowerShell blocks virtual-environment activation, run this in that terminal and then activate again:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

The backend should be available at `http://127.0.0.1:8000`. Swagger is at `http://127.0.0.1:8000/docs`. Keep this terminal open.

### Backend environment variables

Edit `backend/.env`:

```dotenv
SECRET_KEY=replace-with-a-long-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./stylehub.db
FRONTEND_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_CURRENCY=inr
```

For local authentication, the example value works, but replace it with a long random secret before sharing/deploying the project. Never commit `.env` or expose your Stripe secret key.

## 2. Configure and run the frontend

Open a **second terminal** in VS Code (leave the backend running) and run:

```powershell
Copy-Item frontend/.env.example frontend/.env
cd frontend
npm install
npm run dev
```

Vite normally displays `http://localhost:5173`. Open that address in your browser.

Edit `frontend/.env` and set your Stripe **publishable test key**:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

After changing `.env` values, stop and restart the corresponding server. Do not use live keys for local testing. Test-card details are available in Stripe's official testing documentation.

## 3. Run the app each time

1. Terminal 1: activate the backend virtual environment (from the `backend` folder) and run `uvicorn app.main:app --reload`.
2. Terminal 2: from the `frontend` folder run `npm run dev`.
3. Visit `http://localhost:5173`.

To stop either server, press `Ctrl+C` in its terminal.

## API endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create user and return a token |
| POST | `/auth/login` | Log in and return a token |
| GET | `/auth/me` | Current authenticated user |
| GET | `/products` | List/search/filter products |
| GET | `/products/{product_id}` | Product detail |
| GET | `/cart` | Current user's cart |
| POST | `/cart/items` | Add/update a cart item |
| PATCH | `/cart/items/{item_id}` | Update quantity |
| DELETE | `/cart/items/{item_id}` | Remove cart item |
| POST | `/orders` | Create order and Stripe PaymentIntent from cart |
| GET | `/orders` | Current user's order history |
| GET | `/orders/{order_id}` | Order details |
| POST | `/orders/{order_id}/confirm` | Retrieve PaymentIntent and confirm its succeeded status |

Prices are stored as integer minor units (`price_cents` field name for compatibility; for INR, the amount represents paise). The backend recalculates totals from database prices; it does not trust totals sent by the browser. Payment confirmation checks the PaymentIntent status, amount, order ID, and user metadata.

## Troubleshooting

- **`pydantic-core` build failure:** this project uses a Python-3.14-compatible Pydantic 2.x range and wheel-only releases where available. Make sure the newly extracted project uses a fresh virtual environment and run the install commands above.
- **`py -3.14` is not found:** confirm the Python launcher sees 3.14 using `py -0p`. You can create the environment with the full path to your Python 3.14 executable if needed.
- **Frontend can't reach API:** confirm the backend is running and `VITE_API_URL=http://localhost:8000` in `frontend/.env`.
- **Checkout says Stripe is not configured:** add a Stripe test secret key to `backend/.env` and a matching test publishable key to `frontend/.env`, then restart both servers.
- **Payment is not confirmed:** complete the test-card payment in Stripe Elements. The app retrieves the PaymentIntent on `/orders/{id}/confirm`; Stripe CLI/webhooks are not needed for this flow.
- **Port already in use:** stop the other process or start the backend with another port and update `VITE_API_URL` accordingly.

This is a local learning/demo project. Before production use, add rate limiting, email verification/password reset, stronger operational logging, migrations, automated integration tests, and production-grade secret management.
