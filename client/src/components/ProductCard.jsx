import Button from './Button'
import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'

export default function ProductCard({ product, onAdd }) {
  const origin = import.meta.env.VITE_API_ORIGIN || 'https://iverto-ai-toy1-h8ra.onrender.com'
  const raw = product.image || (Array.isArray(product.images) ? product.images[0] : '') || ''
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="20">No image</text></svg>'
  const isDev = import.meta.env.DEV
  const toSameOriginIfUploads = (url) => url.startsWith('http') && url.includes('/uploads/') ? url.replace(/^https?:\/\/[^/]+/, '') : url
  const computed = raw ? (raw.startsWith('http') ? (raw.includes('/uploads/') ? raw : '') : `${origin}${raw}`) : ''
  const imgSrc = raw ? (isDev ? toSameOriginIfUploads(computed) : computed) : placeholder
  const capitalize = (s) => (s || '').charAt(0).toUpperCase() + (s || '').slice(1)
  const buildFallback = (p) => {
    const name = capitalize(p.name || 'Toy')
    const cat = p.category ? capitalize(p.category) : 'Toy'
    const brand = p.brand ? ` by ${p.brand}` : ''
    const age = p.ageGroup ? ` • Ages ${p.ageGroup}` : ''
    return `${name}${brand} — ${cat} made for everyday play${age}.`
  }
  const desc = (product.description || '').trim()
  const rawSnippet = desc || buildFallback(product)
  const snippet = rawSnippet.length > 100 ? `${rawSnippet.slice(0, 100)}…` : rawSnippet
  return (
    <div className="card border bg-white overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative">
          {product.stock !== undefined && product.stock <= 0 && (
            <span className="absolute left-2 top-2 rounded bg-rose-600 px-2 py-1 text-xs text-white">Out of stock</span>
          )}
          <img src={imgSrc} alt={product.name} className="h-48 w-full object-cover" />
        </div>
      </Link>
      <div className="p-4">
        <h3 className="font-medium">{product.name}</h3>
        <p className="mt-1 text-slate-600 text-sm">{snippet}</p>
        <p className="mt-1 text-brand-700 font-semibold">${product.price.toFixed(2)}</p>
        <div className="mt-1">
          <RatingStars value={product.rating || 0} />
        </div>
        <div className="mt-3">
          <Button onClick={() => onAdd?.(product)} disabled={product.stock !== undefined && product.stock <= 0}>Add to cart</Button>
        </div>
      </div>
    </div>
  )
}