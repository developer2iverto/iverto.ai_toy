const categories = [
  { id: 'plush', name: 'Plush' },
  { id: 'wooden', name: 'Wooden' },
  { id: 'learning', name: 'Learning' },
  { id: 'rattles', name: 'Rattles' }
]

export default function CategoryMenu({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onChange?.(c.id)}
          className={`px-4 py-2 rounded-full border ${active === c.id ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-700 hover:bg-brand-50 border-slate-200'}`}
        >
          {c.name}
        </button>
      ))}
      <button
        onClick={() => onChange?.('all')}
        className={`px-4 py-2 rounded-full border ${active === 'all' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-slate-700 hover:bg-brand-50 border-slate-200'}`}
      >
        All
      </button>
    </div>
  )
}