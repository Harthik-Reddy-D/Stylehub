import { Link } from 'react-router-dom'
import { formatMoney } from '../utils'

export default function ProductCard({ product, onAdd }) {
  return (
    <article className="product-card group">
      <Link to={`/products/${product.id}`} className="block overflow-hidden rounded-2xl bg-[#ebe7df]">
        <img src={product.image_url} alt={product.name} loading="lazy" className="product-image" />
      </Link>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-ink/45">{product.category}</p>
          <Link to={`/products/${product.id}`} className="line-clamp-2 font-semibold text-ink hover:text-clay">{product.name}</Link>
          <p className="mt-2 font-semibold text-pine">{formatMoney(product.price_cents)}</p>
        </div>
        {onAdd && <button onClick={() => onAdd(product)} className="add-button" aria-label={`Add ${product.name} to bag`}>+</button>}
      </div>
    </article>
  )
}
