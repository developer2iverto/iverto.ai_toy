import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo'
import Container from './Container'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

export default function Header() {
  const { items } = useCart()
  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const { user, logout } = useAuth()
  const { settings } = useSettings()
  const bannerBg = settings?.brandColor || '#ef4444'

  return (
    <header className="sticky top-0 z-50">
      {settings?.bannerEnabled && settings?.bannerText && (
        <div style={{ backgroundColor: bannerBg }} className="text-white text-center text-sm py-2 px-3">
          {settings.bannerText}
        </div>
      )}
      <div className="bg-white/80 backdrop-blur border-b">
      <Container className="flex h-16 items-center justify-between">
        <Link to="/" aria-label="Home">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Home</NavLink>
          <NavLink to="/shop" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Shop</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>About</NavLink>
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Contact</NavLink>
        </nav>
        <div className="flex items-center gap-4">
          <NavLink to="/cart" className="relative">
            <span className="material-symbols-outlined">shopping_cart</span>
            {count > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1 text-xs text-white">{count}</span>
            )}
          </NavLink>
          {user ? (
            <div className="flex items-center gap-3">
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Orders</NavLink>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Profile</NavLink>
              {(user.role === 'admin' || user.role === 'superadmin') && (
                <NavLink to="/admin" className={({ isActive }) => isActive ? 'text-brand-600' : 'text-slate-700'}>Admin</NavLink>
              )}
              <button onClick={logout} className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login" className="rounded-md border px-3 py-1 text-sm hover:bg-slate-50">Sign in</NavLink>
              <NavLink to="/signup" className="rounded-md bg-brand-600 px-3 py-1 text-sm text-white hover:bg-brand-700">Sign up</NavLink>
            </div>
          )}
        </div>
      </Container>
      </div>
    </header>
  )
}