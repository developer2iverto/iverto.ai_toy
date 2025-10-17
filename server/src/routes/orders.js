import express from 'express'
import mongoose from 'mongoose'
import { authenticate, requireRole } from '../middleware/auth.js'
import { Order } from '../models/Order.js'
import { orderCreateRules } from '../validators/orders.js'
import { validationResult } from 'express-validator'
import catchAsync from '../utils/catchAsync.js'

// In-memory fallback store when DB is not connected (dev only)
const inMemoryOrders = []

const router = express.Router()

router.post('/', authenticate, orderCreateRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  // Calculate totals and shipping on the server to ensure consistency
  const SHIPPING_RATES = { standard: 5.99, express: 12.99 }
  const FREE_SHIPPING_THRESHOLD = 100
  const method = req.body.shippingMethod || 'standard'
  const paymentMethod = req.body.paymentMethod === 'cod' ? 'cod' : 'online'
  const itemsTotal = Array.isArray(req.body.products)
    ? req.body.products.reduce((sum, p) => sum + (Number(p.price) * Number(p.quantity || 0)), 0)
    : 0
  const baseRate = SHIPPING_RATES[method] ?? SHIPPING_RATES.standard
  const shippingCost = method === 'standard' && itemsTotal >= FREE_SHIPPING_THRESHOLD ? 0 : baseRate

  const payload = { ...req.body, userId: req.user.id, totalAmount: itemsTotal, shippingMethod: method, shippingCost, paymentMethod }

  if (mongoose.connection.readyState !== 1) {
    const id = Math.random().toString(36).slice(2)
    inMemoryOrders.unshift({ id, ...payload, orderStatus: 'Pending', paymentStatus: 'pending', createdAt: new Date() })
    return res.status(201).json({ id })
  }

  const doc = await Order.create(payload)
  res.status(201).json({ id: doc._id?.toString() })
}))

router.get('/my-orders', authenticate, catchAsync(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    const orders = inMemoryOrders.filter(o => String(o.userId) === String(req.user.id))
    return res.json(orders)
  }
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean()
  res.json(orders.map(o => ({ id: o._id?.toString(), ...o })))
}))

router.get('/', authenticate, requireRole('admin', 'superadmin'), catchAsync(async (req, res) => {
  if (mongoose.connection.readyState !== 1) {
    return res.json(inMemoryOrders)
  }
  const orders = await Order.find().sort({ createdAt: -1 }).lean()
  res.json(orders.map(o => ({ id: o._id?.toString(), ...o })))
}))

router.put('/:id/status', authenticate, requireRole('admin', 'superadmin'), catchAsync(async (req, res) => {
  const { id } = req.params
  const { orderStatus } = req.body
  if (mongoose.connection.readyState !== 1) {
    const idx = inMemoryOrders.findIndex(o => o.id === id)
    if (idx === -1) return res.status(404).json({ error: 'Order not found' })
    inMemoryOrders[idx].orderStatus = orderStatus
    return res.json({ ok: true })
  }
  const doc = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true }).lean()
  if (!doc) return res.status(404).json({ error: 'Order not found' })
  res.json({ ok: true })
}))

export default router