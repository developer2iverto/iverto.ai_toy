import Container from '../components/Container'
import Button from '../components/Button'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const { items, removeItem, updateQty, total, clear } = useCart()
  const navigate = useNavigate()

  return (
    <Container className="mt-10">
      <h1 className="text-2xl font-semibold">Your Cart</h1>
      {items.length === 0 ? (
        <p className="mt-4">Your cart is empty.</p>
      ) : (
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="card border p-4 flex items-center gap-4">
                <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-slate-600">${item.price.toFixed(2)}</p>
                </div>
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={e => updateQty(item.id, parseInt(e.target.value || 1, 10))}
                  className="w-16 border rounded px-2 py-1"
                />
                <button onClick={() => removeItem(item.id)} className="text-slate-600 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
          <div className="card border p-4">
            <p className="text-lg font-semibold">Order Summary</p>
            <p className="mt-2">Total: <span className="font-bold">${total.toFixed(2)}</span></p>
            <div className="mt-4 space-y-3">
              <Button onClick={() => navigate('/checkout')}>Checkout</Button>
              <button onClick={clear} className="text-slate-600 hover:text-red-600">Clear cart</button>
            </div>
          </div>
        </div>
      )}
    </Container>
  )
}