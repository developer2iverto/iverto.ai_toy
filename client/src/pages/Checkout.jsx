import Container from '../components/Container'
import Button from '../components/Button'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder, createPaymentOrder, verifyPayment } from '../services/api'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, total, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [address, setAddress] = useState({ name: (user?.name || ''), email: (user?.email || ''), line1: '', city: '', country: '' })
  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [status, setStatus] = useState('')

  const estimateShipping = (subtotal, method) => {
    const FREE_SHIPPING_THRESHOLD = 100
    if (method === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD) return 0
    return method === 'express' ? 12.99 : 5.99
  }
  const shippingCost = estimateShipping(total, shippingMethod)
  const finalTotal = (total + shippingCost).toFixed(2)
  const canSubmit = !!user && items.length > 0
  const hasItems = items.length > 0

  const submitOrder = async () => {
    const products = items.map(i => ({ productId: i.id, quantity: i.qty, price: i.price }))
    const payload = { products, shippingAddress: address, shippingMethod, paymentMethod }
    try {
      // If user chose online payment, go through Razorpay
      if (paymentMethod === 'online') {
        // Save payload and navigate to dedicated payment page
        try { sessionStorage.setItem('paymentPayload', JSON.stringify(payload)) } catch {}
        navigate('/payment', { state: { payload } })
        return
      }
      // Otherwise, create order without online payment (COD / dev)
      await createOrder(payload)
      setStatus('Order placed!')
      clear()
      navigate('/shop')
    } catch (e) {
      if (e?.response?.status === 501) {
        // Final fallback in case payment check happens outside the block
        try {
          await createOrder(payload)
          setStatus('Order placed! (No online payment)')
          clear()
          navigate('/shop')
        } catch {
          setStatus('Order failed')
        }
      } else {
        setStatus('Order failed')
      }
    }
  }

  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      {!user && <p className="mt-4">Please login to continue.</p>}
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Full name" className="border rounded px-3 py-2" value={address.name} onChange={e => setAddress({ ...address, name: e.target.value })} />
            <input placeholder="Email" type="email" className="border rounded px-3 py-2" value={address.email} onChange={e => setAddress({ ...address, email: e.target.value })} />
          </div>
          <input placeholder="Address line" className="w-full border rounded px-3 py-2" value={address.line1} onChange={e => setAddress({ ...address, line1: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="City" className="border rounded px-3 py-2" value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} />
            <input placeholder="Country" className="border rounded px-3 py-2" value={address.country} onChange={e => setAddress({ ...address, country: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="text-slate-700 self-center">Shipping Method</label>
            <select className="border rounded px-3 py-2" value={shippingMethod} onChange={e => setShippingMethod(e.target.value)}>
              <option value="standard">Standard (3–5 days)</option>
              <option value="express">Express (1–2 days)</option>
            </select>
          </div>
        </div>
        <div className="card border p-4">
          <p className="font-semibold">Order Summary</p>
          <div className="mt-2 space-y-1">
            <p>Subtotal: ${total.toFixed(2)}</p>
            {hasItems && <p>Shipping ({shippingMethod}): ${shippingCost.toFixed(2)}</p>}
            {hasItems && <p className="font-medium">Total: ${finalTotal}</p>}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <label className="text-slate-700 self-center">Payment Method</label>
              <select className="border rounded px-3 py-2" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                <option value="online">Online (Razorpay)</option>
                <option value="cod">Cash on Delivery (dev)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Button onClick={submitOrder} disabled={!canSubmit}>
              Place Order
            </Button>
            {!user && (
              <p className="text-slate-600 text-sm">Please login to place your order.</p>
            )}
            {items.length === 0 && (
              <p className="text-slate-600 text-sm">Your cart is empty. Add items to place an order.</p>
            )}
            {status && <p className="text-slate-600">{status}</p>}
          </div>
        </div>
      </div>
    </Container>
  )
}