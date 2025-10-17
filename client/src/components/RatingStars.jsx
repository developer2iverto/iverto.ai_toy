export default function RatingStars({ value = 0 }) {
  const v = Math.max(0, Math.min(5, Math.round(value)))
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${v} out of 5`}>
      {[...Array(5)].map((_, i) => (
        <span key={i} className={`material-symbols-outlined text-sm ${i < v ? 'text-amber-500' : 'text-slate-300'}`}>star</span>
      ))}
    </div>
  )
}