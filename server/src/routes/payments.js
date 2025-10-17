import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { authenticate } from '../middleware/auth.js'
import { Order } from '../models/Order.js'

const router = express.Router()

const keyId = process.env.RAZORPAY_KEY_ID || ''
const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
const enabled = !!(keyId && keySecret)
const razor = enabled ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null

// Create Razorpay order for the given cart payload
router.post('/create', authenticate, async (req, res, next) => {
  try {
    if (!enabled) return res.status(501).json({ error: 'Razorpay not configured' })

    const SHIPPING_RATES = { standard: 599, express: 1299 } // in paise
    const FREE_SHIPPING_THRESHOLD = 10000 // ₹100.00 in paise
    const { products = [], shippingMethod = 'standard', shippingAddress = {} } = req.body
    const itemsTotalPaise = Array.isArray(products)
      ? products.reduce((sum, p) => sum + Math.round(Number(p.price) * 100) * Number(p.quantity || 0), 0)
      : 0
    const baseRate = SHIPPING_RATES[shippingMethod] ?? SHIPPING_RATES.standard
    const shippingCostPaise = shippingMethod === 'standard' && itemsTotalPaise >= FREE_SHIPPING_THRESHOLD ? 0 : baseRate
    const amountPaise = itemsTotalPaise + shippingCostPaise

    const payload = {
      userId: req.user.id,
      products,
      totalAmount: amountPaise / 100,
      shippingAddress,
      shippingMethod,
      shippingCost: shippingCostPaise / 100,
      paymentMethod: 'online',
      paymentStatus: 'pending',
      orderStatus: 'Pending'
    }

    let orderDoc
    if (mongoose.connection.readyState === 1) {
      orderDoc = await Order.create(payload)
    } else {
      orderDoc = { _id: Math.random().toString(36).slice(2) }
    }

    const rpOrder = await razor.orders.create({ amount: amountPaise, currency: 'INR', receipt: orderDoc._id.toString(), payment_capture: 1 })

    if (mongoose.connection.readyState === 1) {
      await Order.findByIdAndUpdate(orderDoc._id, { razorpayOrderId: rpOrder.id })
    }

    res.status(201).json({ orderId: rpOrder.id, amount: rpOrder.amount, currency: rpOrder.currency, keyId, orderRefId: orderDoc._id.toString() })
  } catch (err) {
    next(err)
  }
})

// Verify Razorpay payment and mark order as paid/failed
router.post('/verify', authenticate, async (req, res, next) => {
  try {
    if (!enabled) return res.status(501).json({ error: 'Razorpay not configured' })
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderRefId } = req.body
    const hmac = crypto.createHmac('sha256', keySecret)
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
    const digest = hmac.digest('hex')
    const ok = digest === razorpay_signature

    if (mongoose.connection.readyState === 1) {
      await Order.findByIdAndUpdate(orderRefId, { paymentStatus: ok ? 'paid' : 'failed', razorpayPaymentId: razorpay_payment_id })
    }

    res.json({ ok })
  } catch (err) {
    next(err)
  }
})

export default router