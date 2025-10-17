import { useSettings } from '../context/SettingsContext'

export default function Logo() {
  const { settings } = useSettings()
  const { logoUrl, siteName } = settings || {}
  return (
    <div className="flex items-center gap-2">
      {logoUrl ? (
        <img src={logoUrl} alt={siteName || 'Logo'} className="h-8 w-8 rounded-full object-cover" />
      ) : (
        <div className="h-8 w-8 rounded-full bg-brand-400" />
      )}
      <span className="font-display text-lg font-semibold">{siteName || 'Baby Toys'}</span>
    </div>
  )
}