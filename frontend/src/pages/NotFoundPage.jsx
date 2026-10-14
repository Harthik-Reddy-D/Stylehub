import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return <section className="page-shell py-24 text-center"><p className="eyebrow">404 · Wrong turn</p><h1 className="mt-3 font-display text-5xl">Nothing in this rack.</h1><p className="mt-4 text-ink/55">That page couldn't be found.</p><Link className="button button-dark mt-7" to="/">Back to StyleHub</Link></section>
}
