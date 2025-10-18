import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Container from '../components/Container'
import Button from '../components/Button'
import RatingStars from '../components/RatingStars'
import { fetchProductById } from '../services/api'
import { useCart } from '../context/CartContext'

export default function Product() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const { addItem } = useCart()

  useEffect(() => {
    fetchProductById(id).then(setProduct).catch(() => setProduct(null))
  }, [id])

  if (!product) {
    return <Container className="mt-10">Loading...</Container>
  }

  return (
    <Container className="mt-10">
      <div className="grid md:grid-cols-2 gap-8">
        {(() => {
          const origin = import.meta.env.VITE_API_ORIGIN || 'https://iverto-ai-toy1-h8ra.onrender.com'
          const raw = product.image || (Array.isArray(product.images) ? product.images[0] : '') || ''
          const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="24">No image</text></svg>'
          const isDev = import.meta.env.DEV
          const toSameOriginIfUploads = (url) => url.startsWith('http') && url.includes('/uploads/') ? url.replace(/^https?:\/\/[^/]+/, '') : url
          const computed = raw ? (raw.startsWith('http') ? (raw.includes('/uploads/') ? raw : '') : `${origin}${raw}`) : ''
          const imgSrc = raw ? (isDev ? toSameOriginIfUploads(computed) : computed) : placeholder
          return <img src={imgSrc} alt={product.name} className="w-full h-72 object-cover card" />
        })()}
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <RatingStars value={product.rating || 0} />
            {product.stock !== undefined && (
              <span className={`text-sm ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? 'In stock' : 'Out of stock'}
              </span>
            )}
          </div>
          <p className="mt-2 text-slate-700">{product.description}</p>
          <p className="mt-4 text-2xl font-bold text-brand-700">${product.price.toFixed(2)}</p>
          <div className="mt-6">
            <Button onClick={() => addItem(product)} disabled={product.stock !== undefined && product.stock <= 0}>Add to cart</Button>
          </div>
        </div>
      </div>
    </Container>
  )
}