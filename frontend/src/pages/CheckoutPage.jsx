import { useEffect, useRef, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { formatMoney } from '../utils'

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
const stripePromise = publishableKey && publishableKey !== 'pk_test_replace_me' ? loadStripe(publishableKey) : null

function PaymentForm({ orderId, totalCents }) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!stripe || !elements) return
    setBusy(true); setError('')
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/order-success/${orderId}` },
      redirect: 'if_required',
    })
    if (result.error) {
      setError(result.error.message || 'Payment could not be completed.')
      setBusy(false)
      return
    }
    if (result.paymentIntent?.status === 'succeeded') {
      try {
        await api.post(`/orders/${orderId}/confirm`)
        navigate(`/order-success/${orderId}`, { replace: true })
      } catch (err) {
        setError(getErrorMessage(err))
      }
    } else {
      setError('Payment has not completed yet. Please check its status and try again if needed.')
    }
    setBusy(false)
  }

  return <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-display text-2xl">Payment details</h2><p className="mt-2 text-sm text-ink/55">Secure test-mode payment processed by Stripe.</p><div className="mt-6 rounded-xl border border-black/10 p-4"><PaymentElement /></div><Alert>{error}</Alert><button className="button button-dark mt-6 w-full" disabled={!stripe || busy}>{busy ? 'Processing…' : `Pay ${formatMoney(totalCents)}`}</button><p className="mt-3 text-center text-xs text-ink/45">Your card details are handled by Stripe, not stored by StyleHub.</p></form>
}

export default function CheckoutPage() {
  const [checkout, setCheckout] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const didStart = useRef(false)

  useEffect(() => {
    if (didStart.current) return
    didStart.current = true
    api.post('/orders')
      .then(({ data }) => setCheckout(data))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (!publishableKey || publishableKey === 'pk_test_replace_me') {
    return <section className="page-shell max-w-2xl py-16"><p className="eyebrow">Almost there</p><h1 className="section-title mt-2">Configure Stripe</h1><div className="mt-6 rounded-2xl border border-clay/30 bg-white p-6"><p className="leading-7 text-ink/70">Checkout needs your Stripe test keys. Add your publishable key to <code>frontend/.env</code> and your secret key to <code>backend/.env</code>, restart both servers, then open checkout again.</p><p className="mt-3 text-sm text-ink/50">No real card details or live keys should be used for this project demo.</p><Link className="button button-dark mt-6" to="/cart">Return to bag</Link></div></section>
  }

  return <section className="page-shell py-12 md:py-16"><Link to="/cart" className="text-sm font-semibold text-ink/55 hover:text-pine">← Back to bag</Link><p className="eyebrow mt-8">One last step</p><h1 className="section-title mt-2">Checkout</h1>
    {loading && <p className="py-12 text-ink/55">Preparing secure checkout…</p>}
    <Alert>{error}</Alert>
    {checkout && <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]"><div><Elements stripe={stripePromise} options={{ clientSecret: checkout.client_secret, appearance: { theme: 'stripe', variables: { colorPrimary: '#23483d', borderRadius: '12px' } } }}><PaymentForm orderId={checkout.order.id} totalCents={checkout.order.total_cents} /></Elements></div><aside className="h-fit rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-display text-2xl">Order summary</h2><div className="mt-5 space-y-4">{checkout.order.items.map((item) => <div key={item.id} className="flex items-center gap-3"><img src={item.image_url} alt={item.product_name} className="h-14 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold">{item.product_name}</p><p className="text-xs text-ink/50">Qty {item.quantity}</p></div><span className="whitespace-nowrap text-sm">{formatMoney(item.line_total_cents)}</span></div>)}</div><div className="mt-5 flex justify-between border-t border-black/10 pt-4 font-bold"><span>Total</span><span>{formatMoney(checkout.order.total_cents)}</span></div></aside></div>}
  </section>
}
