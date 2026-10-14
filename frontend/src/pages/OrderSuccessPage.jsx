import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { formatMoney, humanizeStatus } from '../utils'

export default function OrderSuccessPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [message, setMessage] = useState('Confirming payment with Stripe…')
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api.post(`/orders/${id}/confirm`)
      .then(({ data }) => { if (active) { setOrder(data); setMessage(data.status === 'paid' ? 'Your payment is confirmed. Thank you for shopping with StyleHub.' : `Order status: ${humanizeStatus(data.status)}`); setError('') } })
      .catch((err) => { if (active) { setError(getErrorMessage(err)); setMessage('Your order was created, but its payment is not confirmed yet.') } })
    return () => { active = false }
  }, [id])

  return <section className="page-shell max-w-3xl py-16 text-center md:py-24"><div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-pine/10 text-3xl text-pine">{order?.status === 'paid' ? '✓' : '✳'}</div><p className="eyebrow mt-6">Order #{id}</p><h1 className="mt-2 font-display text-4xl sm:text-5xl">{order?.status === 'paid' ? 'That’s a wrap.' : 'Thanks for your order.'}</h1><p className="mx-auto mt-4 max-w-lg leading-7 text-ink/60">{message}</p><Alert>{error}</Alert>{order && <div className="mx-auto mt-8 max-w-md rounded-2xl bg-white p-5 text-left shadow-sm"><div className="flex justify-between text-sm"><span className="text-ink/55">Status</span><strong>{humanizeStatus(order.status)}</strong></div><div className="mt-3 flex justify-between text-sm"><span className="text-ink/55">Total</span><strong>{formatMoney(order.total_cents, order.currency.toUpperCase())}</strong></div></div>}<div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/orders" className="button button-dark">View orders</Link><Link to="/" className="button button-light">Back to shop</Link></div></section>
}
