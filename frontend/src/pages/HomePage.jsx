import { useEffect, useMemo, useState } from 'react'
import api, { getErrorMessage } from '../api/client'
import ProductCard from '../components/ProductCard'
import Alert from '../components/Alert'
import { useAuth } from '../context/AuthContext'

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    api.get('/products')
      .then(({ data }) => { setProducts(data); setError('') })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category))], [products])
  const filtered = products.filter((p) => {
    const matchesText = `${p.name} ${p.description} ${p.category}`.toLowerCase().includes(search.toLowerCase())
    return matchesText && (category === 'All' || p.category === category)
  })

  const addToBag = async (product) => {
    if (!user) {
      setNotice('Sign in to add items to your bag.')
      return
    }
    try {
      await api.post('/cart/items', { product_id: product.id, quantity: 1 })
      setNotice(`${product.name} added to your bag.`)
    } catch (err) {
      setNotice(getErrorMessage(err))
    }
    window.setTimeout(() => setNotice(''), 3200)
  }

  return (
    <>
      <section className="hero-band">
        <div className="page-shell grid items-center gap-10 py-14 md:grid-cols-[1.05fr_.95fr] md:py-20">
          <div className="relative z-10">
            <p className="eyebrow mb-5">The new everyday</p>
            <h1 className="max-w-2xl font-display text-5xl leading-[1.04] tracking-tight text-ink sm:text-6xl lg:text-7xl">Good things.<br /><em className="font-normal text-clay">Great style.</em></h1>
            <p className="mt-6 max-w-md text-base leading-7 text-ink/65">Thoughtfully picked pieces that make getting dressed feel easy. Find your next favourite in the StyleHub edit.</p>
            <a href="#shop" className="button button-dark mt-8">Explore the collection <span aria-hidden="true">↘</span></a>
            <div className="mt-10 flex gap-8 text-sm text-ink/55"><span><strong className="text-ink">12</strong> curated styles</span><span><strong className="text-ink">Easy</strong> everyday fits</span></div>
          </div>
          <div className="hero-image-wrap">
            <img className="hero-image" src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=90" alt="People browsing stylish everyday fashion" />
            <div className="hero-sticker"><span>STYLE</span><strong>YOUR<br />OWN WAY</strong><span className="text-clay">✳</span></div>
          </div>
        </div>
      </section>

      <section id="shop" className="page-shell scroll-mt-8 py-16 md:py-20">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="eyebrow mb-3">Made for repeat wear</p><h2 className="section-title">The collection</h2><p className="mt-2 text-sm text-ink/55">Small details. Versatile pieces. Your personal uniform.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="sr-only" htmlFor="product-search">Search products</label>
            <input id="product-search" className="field min-w-56" placeholder="Search the collection…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <label className="sr-only" htmlFor="category-filter">Filter category</label>
            <select id="category-filter" className="field" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
          </div>
        </div>
        {notice && <div className="mb-5 rounded-xl bg-pine/10 px-4 py-3 text-sm text-pine">{notice}</div>}
        <Alert>{error}</Alert>
        {loading ? <p className="py-16 text-center text-ink/50">Loading the collection…</p> : filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={addToBag} />)}</div> : <p className="py-16 text-center text-ink/55">No products match your search.</p>}
      </section>
    </>
  )
}
