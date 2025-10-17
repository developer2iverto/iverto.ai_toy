import { useEffect, useMemo, useState } from 'react'
import Container from '../components/Container'
import Hero from '../components/Hero'
import CategoryMenu from '../components/CategoryMenu'
import ProductCard from '../components/ProductCard'
import OfferCard from '../components/OfferCard'
import { useCart } from '../context/CartContext'
import { fetchProducts, fetchOffers } from '../services/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [offers, setOffers] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const { addItem } = useCart()

  useEffect(() => {
    fetchProducts()
      .then(res => {
        const items = Array.isArray(res) ? res : (res.items || [])
        setProducts(items)
      })
      .catch(() => setProducts([]))
    fetchOffers()
      .then(data => setOffers(Array.isArray(data) ? data : []))
      .catch(() => setOffers([]))
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'all') return products
    return products.filter(p => p.category === activeCat)
  }, [products, activeCat])

  return (
    <div>
      <Hero />
      {offers.length > 0 && (
        <Container className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold">Offers</h2>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {offers.map(o => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        </Container>
      )}
      <Container className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold">Featured Toys</h2>
          <CategoryMenu active={activeCat} onChange={setActiveCat} />
        </div>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onAdd={addItem} />
          ))}
        </div>
      </Container>
    </div>
  )
}