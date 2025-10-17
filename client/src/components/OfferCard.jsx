import { Link } from 'react-router-dom'

export default function OfferCard({ offer }) {
  const placeholder = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="320"><rect width="100%" height="100%" fill="#f1f5f9"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-size="20">Offer image</text></svg>'
  return (
    <Link to={offer.href || '/shop'} className="group block overflow-hidden rounded-lg border">
      <div className="relative h-40 md:h-48 w-full">
        <img src={offer.image} alt={offer.title} onError={(e) => { e.currentTarget.src = placeholder }} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        {offer.badge && (
          <span className="absolute top-2 left-2 rounded bg-brand-600 px-2 py-1 text-xs text-white">
            {offer.badge}
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium">{offer.title}</p>
        {offer.subtitle && <p className="text-slate-600 text-sm">{offer.subtitle}</p>}
        <p className="mt-2 text-brand-600 text-sm">Shop now →</p>
      </div>
    </Link>
  )
}