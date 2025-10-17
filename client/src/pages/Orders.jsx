import Container from '../components/Container'
import { myOrders } from '../services/api'
import { useEffect, useState } from 'react'
import ProtectedRoute from '../components/ProtectedRoute'

function OrdersContent() {
  const [orders, setOrders] = useState([])
  useEffect(() => { myOrders().then(setOrders).catch(() => setOrders([])) }, [])
  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">My Orders</h1>
      <div className="mt-6 space-y-4">
        {orders.map(o => (
          <div key={o.id} className="card border p-4">
            <p className="font-medium">Order #{o.id}</p>
            <p>Status: {o.orderStatus}</p>
            <p>Subtotal: ${Number(o.totalAmount).toFixed(2)}</p>
            <p>Shipping ({o.shippingMethod || 'standard'}): ${Number(o.shippingCost || 0).toFixed(2)}</p>
            <p>Payment: {o.paymentMethod || 'online'}</p>
            <p className="font-medium">Total: ${(Number(o.totalAmount) + Number(o.shippingCost || 0)).toFixed(2)}</p>
          </div>
        ))}
        {orders.length === 0 && <p>No orders yet.</p>}
      </div>
    </Container>
  )
}

export default function Orders() {
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  )
}