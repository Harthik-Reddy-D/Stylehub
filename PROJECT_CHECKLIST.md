# Rebuild notes and validation checklist

- Intended runtime: Python 3.14.x (64-bit AMD64), Node.js 24.x.
- No Docker files are included.
- Backend dependencies use compatible version ranges instead of freezing the old `pydantic==2.11.3` pin that triggered a Python 3.14 build attempt.
- Pydantic v2 is used throughout; models use `ConfigDict(from_attributes=True)` and `pydantic-settings` for environment values.
- Stripe checkout is intentionally disabled until valid Stripe test keys are placed in the local `.env` files.
- The backend retrieves PaymentIntents in `POST /orders/{order_id}/confirm`; no webhook listener or Stripe CLI is needed for this flow.

Before submission, run backend and frontend locally, create a test account, add products to the cart, configure Stripe test keys, complete a test-card payment, and verify the paid order appears in order history.
