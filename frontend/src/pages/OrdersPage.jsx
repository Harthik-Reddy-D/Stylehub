import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { formatMoney, humanizeStatus } from '../utils'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data)).catch((err) => setError(getErrorMessage(err))).finally(() => setLoading(false))
  }, [])

  return <section className="page-shell py-12 md:py-16"><p className="eyebrow">Your StyleHub history</p><h1 className="section-title mt-2">Orders</h1><Alert>{error}</Alert>{loading ? <p className="py-12 text-ink/55">Loading orders…</p> : !orders.length ? <div className="empty-state mt-8"><h2 className="font-display text-3xl">Your next favourite is waiting.</h2><p className="mt-2 text-sm text-ink/55">You haven't placed an order yet.</p><Link className="button button-dark mt-6" to="/">Explore the collection</Link></div> : <div className="mt-8 space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-ink/40">Order #{order.id}</p><p className="mt-1 text-sm text-ink/55">{new Date(order.created_at).toLocaleString()}</p></div><span className={`status-pill status-${order.status}`}>{humanizeStatus(order.status)}</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-4"><div className="flex -space-x-2">{order.items.slice(0, 4).map((item) => <img key={item.id} className="h-12 w-12 rounded-xl border-2 border-white object-cover" src={item.image_url} alt={item.product_name} title={item.product_name} />)}<span className="grid h-12 w-12 place-items-center rounded-xl border-2 border-white bg-paper text-xs text-ink/55">{order.items.reduce((sum, item) => sum + item.quantity, 0)}×</span></div><div className="text-right"><p className="text-xs text-ink/45">Total</p><p className="font-bold">{formatMoney(order.total_cents, order.currency.toUpperCase())}</p></div></div></article>)}</div>}</section>
}
