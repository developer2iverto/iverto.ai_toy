import Container from '../components/Container'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImages,
  listAllOrders,
  updateOrderStatus,
  fetchUsers,
  updateUserRole,
  deleteUser,
  getAdminSettings,
  updateSettings,
} from '../services/api'

function DashboardContent() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [users, setUsers] = useState([])
  const [creating, setCreating] = useState(false)
  const [newProd, setNewProd] = useState({ name: '', price: '', description: '', category: '', brand: '', ageGroup: '', stock: '' })
  const [newImages, setNewImages] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [settings, setSettings] = useState({ siteName: '', logoUrl: '', brandColor: '#ef4444', bannerEnabled: false, bannerText: '' })
  const [savingSettings, setSavingSettings] = useState(false)

  const loadProducts = async () => {
    try {
      const res = await fetchProducts({ limit: 100 })
      const items = Array.isArray(res) ? res : (res.items || [])
      setProducts(items)
    } catch {}
  }
  const loadOrders = async () => {
    try { setOrders(await listAllOrders()) } catch {}
  }
  const loadUsers = async () => {
    if (user?.role !== 'superadmin') return
    try { setUsers(await fetchUsers()) } catch {}
  }
  const loadSettings = async () => {
    if (user?.role !== 'superadmin') return
    try { setSettings(await getAdminSettings()) } catch {}
  }

  useEffect(() => {
    loadProducts()
    loadOrders()
    loadUsers()
    loadSettings()
  }, [user])

  const createNewProduct = async () => {
    try {
      setCreating(true)
      let images = []
      if (newImages && newImages.length) {
        const up = await uploadImages(newImages)
        images = up.urls || []
      }
      const payload = {
        name: newProd.name,
        price: Number(newProd.price),
        description: newProd.description || undefined,
        category: newProd.category || undefined,
        brand: newProd.brand || undefined,
        ageGroup: newProd.ageGroup || undefined,
        stock: newProd.stock === '' ? undefined : Number(newProd.stock),
        images,
      }
      await createProduct(payload)
      setNewProd({ name: '', price: '', description: '', category: '', brand: '', ageGroup: '', stock: '' })
      setNewImages([])
      await loadProducts()
    } catch (e) {
      // noop; you may add notifications
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (p) => {
    setEditingId(p.id)
    setEditData({ name: p.name, price: p.price, description: p.description || '', category: p.category || '', brand: p.brand || '', ageGroup: p.ageGroup || '', stock: p.stock ?? '' })
  }
  const saveEdit = async () => {
    if (!editingId) return
    const payload = {
      name: editData.name || undefined,
      price: editData.price === '' ? undefined : Number(editData.price),
      description: editData.description || undefined,
      category: editData.category || undefined,
      brand: editData.brand || undefined,
      ageGroup: editData.ageGroup || undefined,
      stock: editData.stock === '' ? undefined : Number(editData.stock),
    }
    try {
      await updateProduct(editingId, payload)
      setEditingId(null)
      setEditData({})
      await loadProducts()
    } catch {}
  }

  const makeDescription = (p) => {
    const parts = []
    const cat = p.category ? `${p.category} ` : ''
    parts.push(`${p.name} is a ${cat}toy designed to delight and engage.`)
    if (p.brand) parts.push(`Made by ${p.brand}.`)
    if (p.ageGroup) parts.push(`Suitable for ages ${p.ageGroup}.`)
    parts.push(`Crafted with safe materials and thoughtful design for everyday play.`)
    return parts.join(' ')
  }

  const [filling, setFilling] = useState(false)
  const autoFillDescriptions = async () => {
    try {
      setFilling(true)
      const missing = products.filter(p => !p.description || !String(p.description).trim())
      for (const p of missing) {
        const desc = makeDescription(p)
        await updateProduct(p.id, { description: desc })
      }
      await loadProducts()
    } catch {}
    finally { setFilling(false) }
  }

  const removeProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); await loadProducts() } catch {}
  }

  const updateStatus = async (id, orderStatus) => {
    try { await updateOrderStatus(id, orderStatus); await loadOrders() } catch {}
  }

  const setRole = async (id, role) => {
    try { await updateUserRole(id, role); await loadUsers() } catch {}
  }
  const removeUser = async (id) => {
    if (!confirm('Delete this user?')) return
    try { await deleteUser(id); await loadUsers() } catch {}
  }

  const saveSettings = async () => {
    if (user?.role !== 'superadmin') return
    try {
      setSavingSettings(true)
      let logoUrl = settings.logoUrl
      // If a new file is selected in a dedicated input with id 'settings-logo', upload it
      // We reuse newImages as a temporary single-file holder for logo upload
      if (newImages && newImages.length) {
        const up = await uploadImages(newImages)
        logoUrl = (up.urls || [])[0] || logoUrl
      }
      const payload = { siteName: settings.siteName, logoUrl, brandColor: settings.brandColor, bannerEnabled: !!settings.bannerEnabled, bannerText: settings.bannerText }
      const updated = await updateSettings(payload)
      setSettings(updated)
      setNewImages([])
    } catch {} finally { setSavingSettings(false) }
  }

  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>
      <p className="mt-2 text-slate-600">Role: {user?.role}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className={`px-3 py-2 rounded-md border ${tab === 'overview' ? 'bg-brand-600 text-white border-brand-600' : ''}`} onClick={() => setTab('overview')}>Overview</button>
        <button className={`px-3 py-2 rounded-md border ${tab === 'products' ? 'bg-brand-600 text-white border-brand-600' : ''}`} onClick={() => setTab('products')}>Products</button>
        <button className={`px-3 py-2 rounded-md border ${tab === 'orders' ? 'bg-brand-600 text-white border-brand-600' : ''}`} onClick={() => setTab('orders')}>Orders</button>
        {user?.role === 'superadmin' && (
          <button className={`px-3 py-2 rounded-md border ${tab === 'users' ? 'bg-brand-600 text-white border-brand-600' : ''}`} onClick={() => setTab('users')}>Users</button>
        )}
        {user?.role === 'superadmin' && (
          <button className={`px-3 py-2 rounded-md border ${tab === 'settings' ? 'bg-brand-600 text-white border-brand-600' : ''}`} onClick={() => setTab('settings')}>Settings</button>
        )}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div className="card border p-4">
            <p className="font-semibold">Products</p>
            <p className="text-slate-600">Total: {products.length}</p>
          </div>
          <div className="card border p-4">
            <p className="font-semibold">Orders</p>
            <p className="text-slate-600">Total: {orders.length}</p>
          </div>
          {user?.role === 'superadmin' && (
            <div className="card border p-4">
              <p className="font-semibold">Users</p>
              <p className="text-slate-600">Total: {users.length}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 card border p-4">
            <p className="font-semibold">Create Product</p>
            <div className="mt-3 space-y-3">
              <input className="w-full border rounded px-3 py-2" placeholder="Name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
              <input type="number" min="0" className="w-full border rounded px-3 py-2" placeholder="Price" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} />
              <textarea className="w-full border rounded px-3 py-2" rows={3} placeholder="Description" value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Category" value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Brand" value={newProd.brand} onChange={e => setNewProd({ ...newProd, brand: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Age Group" value={newProd.ageGroup} onChange={e => setNewProd({ ...newProd, ageGroup: e.target.value })} />
              <input type="number" min="0" className="w-full border rounded px-3 py-2" placeholder="Stock" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} />
              <input type="file" multiple accept="image/*" onChange={e => setNewImages(e.target.files)} />
              <button disabled={creating || !newProd.name || !newProd.price} onClick={createNewProduct} className="rounded-md bg-brand-600 text-white px-3 py-2 disabled:opacity-50">Create</button>
            </div>
          </div>
          <div className="md:col-span-2 card border p-4">
            <p className="font-semibold">Products</p>
            <div className="mt-2">
              <button className="rounded-md border px-3 py-2" disabled={filling} onClick={autoFillDescriptions}>
                {filling ? 'Filling descriptions...' : 'Auto-fill missing descriptions'}
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {products.map(p => (
                <div key={p.id} className="border rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-slate-600 text-sm">${p.price} • Stock: {p.stock ?? 0}</p>
                      {p.description && <p className="text-slate-700 text-sm mt-1">{p.description}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border px-3 py-1" onClick={() => startEdit(p)}>Edit</button>
                      <button className="rounded-md border px-3 py-1" onClick={() => removeProduct(p.id)}>Delete</button>
                    </div>
                  </div>
                  {editingId === p.id && (
                    <div className="mt-3 grid md:grid-cols-3 gap-3">
                      <input className="border rounded px-3 py-2" placeholder="Name" value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                      <input type="number" min="0" className="border rounded px-3 py-2" placeholder="Price" value={editData.price ?? ''} onChange={e => setEditData({ ...editData, price: e.target.value })} />
                      <textarea className="md:col-span-3 border rounded px-3 py-2" rows={3} placeholder="Description" value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="Category" value={editData.category || ''} onChange={e => setEditData({ ...editData, category: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="Brand" value={editData.brand || ''} onChange={e => setEditData({ ...editData, brand: e.target.value })} />
                      <input className="border rounded px-3 py-2" placeholder="Age Group" value={editData.ageGroup || ''} onChange={e => setEditData({ ...editData, ageGroup: e.target.value })} />
                      <input type="number" min="0" className="border rounded px-3 py-2" placeholder="Stock" value={editData.stock ?? ''} onChange={e => setEditData({ ...editData, stock: e.target.value })} />
                      <div className="md:col-span-3 flex gap-2">
                        <button className="rounded-md bg-brand-600 text-white px-3 py-2" onClick={saveEdit}>Save</button>
                        <button className="rounded-md border px-3 py-2" onClick={() => { setEditingId(null); setEditData({}) }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {products.length === 0 && <p className="text-slate-600">No products yet.</p>}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-6 card border p-4">
          <p className="font-semibold">Orders</p>
          <div className="mt-3 space-y-3">
            {orders.map(o => (
              <div key={o.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{o.id}</p>
                    <p className="text-slate-600 text-sm">User: {o.userId} • Subtotal: ${Number(o.totalAmount).toFixed(2)} • Shipping ({o.shippingMethod || 'standard'}): ${Number(o.shippingCost || 0).toFixed(2)} • Payment: {o.paymentMethod || 'online'} • Total: {(Number(o.totalAmount) + Number(o.shippingCost || 0)).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select value={o.orderStatus} onChange={e => updateStatus(o.id, e.target.value)} className="border rounded px-2 py-1">
                      {['Pending','Processing','Shipped','Delivered'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p className="text-slate-600">No orders found.</p>}
          </div>
        </div>
      )}

      {tab === 'users' && user?.role === 'superadmin' && (
        <div className="mt-6 card border p-4">
          <p className="font-semibold">Users</p>
          <div className="mt-3 space-y-3">
            {users.map(u => (
              <div key={u.id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{u.name} <span className="text-slate-500">({u.email})</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <select value={u.role} onChange={e => setRole(u.id, e.target.value)} className="border rounded px-2 py-1">
                    {['customer','admin','superadmin'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button className="rounded-md border px-3 py-1" onClick={() => removeUser(u.id)}>Delete</button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-slate-600">No users.</p>}
          </div>
        </div>
      )}

      {tab === 'settings' && user?.role === 'superadmin' && (
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div className="card border p-4">
            <p className="font-semibold">Brand & Banner</p>
            <div className="mt-3 space-y-3">
              <input className="w-full border rounded px-3 py-2" placeholder="Site name" value={settings.siteName || ''} onChange={e => setSettings({ ...settings, siteName: e.target.value })} />
              <input className="w-full border rounded px-3 py-2" placeholder="Brand color (hex)" value={settings.brandColor || ''} onChange={e => setSettings({ ...settings, brandColor: e.target.value })} />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="bannerEnabled" checked={!!settings.bannerEnabled} onChange={e => setSettings({ ...settings, bannerEnabled: e.target.checked })} />
                <label htmlFor="bannerEnabled" className="text-slate-700">Show announcement banner</label>
              </div>
              <input className="w-full border rounded px-3 py-2" placeholder="Banner text" value={settings.bannerText || ''} onChange={e => setSettings({ ...settings, bannerText: e.target.value })} />
              <div>
                <label className="text-slate-700">Logo image</label>
                <input type="file" accept="image/*" onChange={e => setNewImages(e.target.files)} />
                {settings.logoUrl && (
                  <div className="mt-2">
                    <img src={settings.logoUrl} alt="Logo" className="h-12 w-12 rounded-full object-cover" />
                  </div>
                )}
              </div>
              <button onClick={saveSettings} disabled={savingSettings} className="rounded-md bg-brand-600 text-white px-3 py-2 disabled:opacity-50">Save Settings</button>
            </div>
          </div>
          <div className="card border p-4">
            <p className="font-semibold">Preview</p>
            <div className="mt-3 rounded-lg overflow-hidden border">
              {settings.bannerEnabled && settings.bannerText && (
                <div style={{ backgroundColor: settings.brandColor || '#ef4444' }} className="text-white text-center text-sm py-2">
                  {settings.bannerText}
                </div>
              )}
              <div className="p-4 flex items-center gap-3">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full" style={{ backgroundColor: settings.brandColor || '#ef4444' }} />
                )}
                <span className="font-display text-lg font-semibold">{settings.siteName || 'Baby Toys Store'}</span>
              </div>
            </div>
            <p className="mt-3 text-slate-600 text-sm">This is how your header will look.</p>
          </div>
        </div>
      )}
    </Container>
  )
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute roles={['admin', 'superadmin']}>
      <DashboardContent />
    </ProtectedRoute>
  )
}