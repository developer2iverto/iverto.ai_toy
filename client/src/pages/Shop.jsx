import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Container from '../components/Container'
import ProductCard from '../components/ProductCard'
import { useCart } from '../context/CartContext'
import { fetchProducts } from '../services/api'
import FilterBar from '../components/FilterBar'

export default function Shop() {
  const location = useLocation()
  const [filters, setFilters] = useState({})
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 12
  const { addItem } = useCart()

  const query = useMemo(() => ({
    q: filters.search || undefined,
    category: filters.category === 'all' ? undefined : filters.category,
    ageGroup: filters.ageGroup === 'all' ? undefined : filters.ageGroup,
    brand: filters.brand === 'all' ? undefined : filters.brand,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    minRating: filters.minRating || undefined,
    sort: filters.sort || undefined,
    page,
    limit,
  }), [filters, page])

  useEffect(() => {
    // Initialize filters from query params (e.g., category)
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    if (category) setFilters(f => ({ ...f, category }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchProducts(query)
      .then((res) => {
        const items = Array.isArray(res) ? res : (res.items || [])
        const t = Array.isArray(res) ? res.length : (res.total || items.length)
        setProducts(items)
        setTotal(t)
      })
      .catch(() => { setProducts([]); setTotal(0) })
  }, [query])

  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">Shop All Toys</h1>
      <div className="mt-4">
        <FilterBar filters={filters} onChange={setFilters} onReset={() => { setFilters({}); setPage(1) }} />
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addItem} />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="rounded-md border px-3 py-2 disabled:opacity-50">Prev</button>
        <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="rounded-md border px-3 py-2 disabled:opacity-50">Next</button>
      </div>
    </Container>
  )
}