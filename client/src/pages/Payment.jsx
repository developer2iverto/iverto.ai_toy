import Container from '../components/Container'
import Button from '../components/Button'
import { useLocation, useNavigate } from 'react-router-dom'
import { createPaymentOrder, verifyPayment } from '../services/api'

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const payload = location.state?.payload || (() => {
    try { return JSON.parse(sessionStorage.getItem('paymentPayload') || 'null') } catch { return null }
  })()

  if (!payload) {
    return (
      <Container className="mt-10">
        <h1 className="text-2xl font-semibold">Payment</h1>
        <p className="mt-4">No payment details found. Please return to checkout.</p>
        <div className="mt-4">
          <Button onClick={() => navigate('/checkout')}>Back to Checkout</Button>
        </div>
      </Container>
    )
  }

  const estimateShipping = (subtotal, method) => {
    const FREE_SHIPPING_THRESHOLD = 100
    if (method === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD) return 0
    return method === 'express' ? 12.99 : 5.99
  }
  const subtotal = Array.isArray(payload.products)
    ? payload.products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity || 0)), 0)
    : 0
  const shippingCost = estimateShipping(subtotal, payload.shippingMethod || 'standard')
  const total = (subtotal + shippingCost).toFixed(2)

  const payNow = async () => {
    const supported = typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined'
    if (!supported) {
      alert('Payment not available in this environment')
      return
    }
    let order
    try {
      order = await createPaymentOrder(payload)
    } catch (err) {
      if (err?.response?.status === 501) {
        alert('Payment not configured. Please contact support.')
        return
      }
      alert('Failed to initialize payment')
      return
    }
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Baby Toys Store',
      description: 'Order Payment',
      order_id: order.orderId,
      prefill: { name: payload?.shippingAddress?.name || '', email: payload?.shippingAddress?.email || '' },
      theme: { color: '#ef4444' },
      handler: async (resp) => {
        try {
          const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = resp
          const verify = await verifyPayment({ razorpay_payment_id, razorpay_order_id, razorpay_signature, orderRefId: order.orderRefId })
          if (verify.ok) {
            sessionStorage.removeItem('paymentPayload')
            navigate('/orders')
          } else {
            alert('Payment verification failed')
          }
        } catch {
          alert('Payment verification error')
        }
      },
      modal: { ondismiss: () => {} }
    }
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">Payment</h1>
      <div className="mt-6 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="card border p-4">
            <p className="font-semibold">Billing Details</p>
            <p className="text-slate-600 mt-2">{payload?.shippingAddress?.name} • {payload?.shippingAddress?.email}</p>
            <p className="text-slate-600">{payload?.shippingAddress?.line1}, {payload?.shippingAddress?.city}, {payload?.shippingAddress?.country}</p>
          </div>
        </div>
        <div className="card border p-4">
          <p className="font-semibold">Order Summary</p>
          <div className="mt-2 space-y-1">
            <p>Subtotal: ${subtotal.toFixed(2)}</p>
            <p>Shipping ({payload.shippingMethod || 'standard'}): ${shippingCost.toFixed(2)}</p>
            <p className="font-medium">Total: ${total}</p>
          </div>
          <div className="mt-4 space-y-3">
            <Button onClick={payNow}>Pay Now</Button>
            <button className="text-slate-600 underline" onClick={() => navigate('/checkout')}>Back to Checkout</button>
          </div>
        </div>
      </div>
    </Container>
  )
}