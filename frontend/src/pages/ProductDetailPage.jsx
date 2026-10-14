import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api, { getErrorMessage } from '../api/client'
import Alert from '../components/Alert'
import { formatMoney } from '../utils'
import { useAuth } from '../context/AuthContext'

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data)).catch((err) => setError(getErrorMessage(err)))
  }, [id])

  const add = async () => {
    if (!user) { navigate('/login'); return }
    setBusy(true); setError(''); setNotice('')
    try {
      await api.post('/cart/items', { product_id: product.id, quantity })
      setNotice('Added to your bag.')
    } catch (err) { setError(getErrorMessage(err)) }
    finally { setBusy(false) }
  }

  if (error && !product) return <div className="page-shell py-16"><Alert>{error}</Alert><Link className="text-pine underline" to="/">Return to the shop</Link></div>
  if (!product) return <div className="page-shell py-16 text-center text-ink/55">Loading product…</div>

  return <section className="page-shell py-10 md:py-16">
    <Link to="/" className="mb-8 inline-flex text-sm font-semibold text-ink/55 hover:text-pine">← Back to the collection</Link>
    <div className="grid gap-10 md:grid-cols-2 md:gap-16">
      <div className="overflow-hidden rounded-3xl bg-[#ebe7df]"><img className="detail-image" src={product.image_url} alt={product.name} /></div>
      <div className="flex flex-col justify-center">
        <p className="eyebrow">{product.category}</p><h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">{product.name}</h1>
        <p className="mt-5 text-2xl font-semibold text-pine">{formatMoney(product.price_cents)}</p>
        <p className="mt-6 max-w-lg leading-7 text-ink/65">{product.description}</p>
        <p className="mt-5 text-sm text-ink/50">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
        <div className="mt-7 flex max-w-sm gap-3">
          <label className="sr-only" htmlFor="quantity">Quantity</label><input id="quantity" className="field w-24" type="number" min="1" max={Math.max(1, product.stock)} value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock || 1)))} />
          <button className="button button-dark flex-1" disabled={busy || product.stock < 1} onClick={add}>{busy ? 'Adding…' : 'Add to bag'}</button>
        </div>
        <Alert>{error}</Alert>{notice && <div className="mt-4 text-sm font-medium text-pine">{notice} <Link className="underline" to="/cart">View bag</Link></div>}
      </div>
    </div>
  </section>
}
