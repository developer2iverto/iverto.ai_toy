import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { Cart } from '../models/Cart.js'
import { addToCartRules, updateCartRules } from '../validators/cart.js'
import { validationResult } from 'express-validator'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router()

router.get('/', authenticate, catchAsync(async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id }).lean()
  res.json(cart || { userId: req.user.id, items: [] })
}))

router.post('/add', authenticate, addToCartRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { productId, quantity = 1 } = req.body
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id, 'items.productId': { $ne: productId } },
    { $push: { items: { productId, quantity } } },
    { new: true, upsert: true }
  )
  // If item already exists, update quantity
  const updated = await Cart.findOneAndUpdate(
    { userId: req.user.id, 'items.productId': productId },
    { $inc: { 'items.$.quantity': quantity } },
    { new: true }
  )
  res.json(updated || cart)
}))

router.put('/update', authenticate, updateCartRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { productId, quantity } = req.body
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id, 'items.productId': productId },
    { $set: { 'items.$.quantity': quantity } },
    { new: true }
  )
  res.json(cart)
}))

router.delete('/remove', authenticate, catchAsync(async (req, res) => {
  const { productId } = req.body
  const cart = await Cart.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { items: { productId } } },
    { new: true }
  )
  res.json(cart)
}))

export default router