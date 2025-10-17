import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

export const useCart = () => useContext(CartContext)

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart')
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) return parsed
      if (parsed && Array.isArray(parsed.items)) return parsed.items
      return []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i)
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, image: product.image, qty }]
    })
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))
  const updateQty = (id, qty) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  const clear = () => setItems([])

  const total = useMemo(() => Array.isArray(items) ? items.reduce((sum, i) => sum + i.price * i.qty, 0) : 0, [items])

  const value = { items, addItem, removeItem, updateQty, clear, total }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}