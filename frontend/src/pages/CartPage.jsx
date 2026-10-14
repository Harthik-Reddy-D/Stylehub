import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { formatMoney } from '../utils'

export default function CartPage() {
  const [cart, setCart] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const navigate = useNavigate()

  const loadCart = useCallback(async () => {
    try { const { data } = await api.get('/cart'); setCart(data); setError('') }
    catch (err) { setError(getErrorMessage(err)) }
  }, [])

  useEffect(() => { loadCart() }, [loadCart])

  const update = async (item, quantity) => {
    setBusyId(item.id); setError('')
    try { const { data } = await api.patch(`/cart/items/${item.id}`, { quantity }); setCart(data) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setBusyId(null) }
  }
  const remove = async (item) => {
    setBusyId(item.id); setError('')
    try { const { data } = await api.delete(`/cart/items/${item.id}`); setCart(data) }
    catch (err) { setError(getErrorMessage(err)) }
    finally { setBusyId(null) }
  }

  return <section className="page-shell py-12 md:py-16"><p className="eyebrow">Your picks</p><h1 className="section-title mt-2">The bag</h1><Alert>{error}</Alert>
    {!cart ? <p className="py-12 text-ink/55">Loading your bag…</p> : cart.items.length === 0 ? <div className="empty-state mt-8"><span className="text-4xl">✳</span><h2 className="mt-4 font-display text-3xl">A little room for something good.</h2><p className="mt-2 text-sm text-ink/55">Your bag is empty right now.</p><Link to="/" className="button button-dark mt-6">Explore the collection</Link></div> :
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]"><div className="space-y-4">{cart.items.map((item) => <article key={item.id} className="cart-line"><img src={item.product.image_url} alt={item.product.name} className="cart-thumb" /><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-widest text-ink/40">{item.product.category}</p><Link className="mt-1 block font-semibold hover:text-clay" to={`/products/${item.product.id}`}>{item.product.name}</Link><p className="mt-2 text-sm text-pine">{formatMoney(item.product.price_cents)}</p><div className="mt-3 flex items-center gap-3"><button className="qty-button" aria-label="Decrease quantity" disabled={busyId === item.id || item.quantity <= 1} onClick={() => update(item, item.quantity - 1)}>−</button><span className="w-4 text-center text-sm">{item.quantity}</span><button className="qty-button" aria-label="Increase quantity" disabled={busyId === item.id || item.quantity >= item.product.stock} onClick={() => update(item, item.quantity + 1)}>+</button><button className="ml-2 text-xs font-semibold text-ink/45 underline hover:text-clay" disabled={busyId === item.id} onClick={() => remove(item)}>Remove</button></div></div><p className="whitespace-nowrap font-semibold">{formatMoney(item.line_total_cents)}</p></article>)}</div>
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm"><h2 className="font-display text-2xl">Order summary</h2><div className="mt-6 flex justify-between text-sm text-ink/60"><span>Subtotal ({cart.item_count} items)</span><span>{formatMoney(cart.subtotal_cents)}</span></div><div className="mt-3 flex justify-between border-t border-black/10 pt-4 text-base font-bold"><span>Total</span><span>{formatMoney(cart.subtotal_cents)}</span></div><p className="mt-3 text-xs leading-5 text-ink/45">Shipping and any applicable taxes are not charged in this demo.</p><button className="button button-dark mt-6 w-full" onClick={() => navigate('/checkout')}>Continue to checkout</button><Link to="/" className="mt-4 block text-center text-sm font-semibold text-pine underline">Keep shopping</Link></aside>
      </div>}
  </section>
}
