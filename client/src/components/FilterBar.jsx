import { useMemo } from 'react'

const categories = [
  { id: 'all', name: 'All' },
  { id: 'plush', name: 'Plush' },
  { id: 'wooden', name: 'Wooden' },
  { id: 'learning', name: 'Learning' },
  { id: 'rattles', name: 'Rattles' },
]
const ageGroups = ['all', '0-2', '2-4', '4-6', '6-8', '8+']
const brands = ['all', 'ToyCo', 'FunKids', 'EduPlay']
const sortOptions = [
  { id: 'newest', name: 'Newest' },
  { id: 'price_asc', name: 'Price: Low to High' },
  { id: 'price_desc', name: 'Price: High to Low' },
  { id: 'rating_desc', name: 'Top Rated' },
]

export default function FilterBar({ filters, onChange, onReset }) {
  const f = useMemo(() => ({
    search: '', category: 'all', ageGroup: 'all', brand: 'all',
    minPrice: '', maxPrice: '', minRating: '', sort: 'newest'
  , ...filters }), [filters])

  return (
    <div className="grid md:grid-cols-4 gap-4 bg-white border p-4 rounded-md">
      <input
        value={f.search}
        onChange={(e) => onChange?.({ ...f, search: e.target.value })}
        placeholder="Search toys..."
        className="border rounded-md px-3 py-2"
      />
      <select value={f.category} onChange={(e) => onChange?.({ ...f, category: e.target.value })} className="border rounded-md px-3 py-2">
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <select value={f.ageGroup} onChange={(e) => onChange?.({ ...f, ageGroup: e.target.value })} className="border rounded-md px-3 py-2">
        {ageGroups.map(a => <option key={a} value={a}>{a === 'all' ? 'All Ages' : a}</option>)}
      </select>
      <select value={f.brand} onChange={(e) => onChange?.({ ...f, brand: e.target.value })} className="border rounded-md px-3 py-2">
        {brands.map(b => <option key={b} value={b}>{b === 'all' ? 'All Brands' : b}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" min="0" placeholder="Min $" value={f.minPrice}
          onChange={(e) => onChange?.({ ...f, minPrice: e.target.value })}
          className="border rounded-md px-3 py-2" />
        <input type="number" min="0" placeholder="Max $" value={f.maxPrice}
          onChange={(e) => onChange?.({ ...f, maxPrice: e.target.value })}
          className="border rounded-md px-3 py-2" />
      </div>
      <select value={f.minRating} onChange={(e) => onChange?.({ ...f, minRating: e.target.value })} className="border rounded-md px-3 py-2">
        <option value="">All ratings</option>
        {[1,2,3,4].map(r => <option key={r} value={r}>{r}+ stars</option>)}
      </select>
      <select value={f.sort} onChange={(e) => onChange?.({ ...f, sort: e.target.value })} className="border rounded-md px-3 py-2">
        {sortOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button onClick={() => onReset?.()} className="rounded-md border px-3 py-2">Reset</button>
      </div>
    </div>
  )
}