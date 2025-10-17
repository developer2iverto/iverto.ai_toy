import express from 'express'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'
import { sampleProducts } from '../data/products.js'
import { authenticate, requireRole } from '../middleware/auth.js'
import { validationResult } from 'express-validator'
import { productCreateRules, productUpdateRules } from '../validators/products.js'
import catchAsync from '../utils/catchAsync.js'

export const fallbackProducts = sampleProducts

export default function productsRouter({ dbConnected }) {
  const router = express.Router()

  // List with filters
  router.get('/', catchAsync(async (req, res) => {
    try {
      const { category, ageGroup, brand, minPrice, maxPrice, rating, q, sort, page = 1, limit = 20 } = req.query
      const filter = {}
      if (category) filter.category = category
      if (ageGroup) filter.ageGroup = ageGroup
      if (brand) filter.brand = brand
      if (minPrice || maxPrice) filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
      if (rating) filter.rating = { $gte: Number(rating) }
      if (q) filter.name = { $regex: q, $options: 'i' }
      const skip = (Number(page) - 1) * Number(limit)
      const [items, total] = await Promise.all([
        Product.find(filter).sort(sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : sort === 'rating' ? { rating: -1 } : { createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
        Product.countDocuments(filter)
      ])
      const normalized = items.map(d => ({ id: d._id?.toString(), name: d.name, description: d.description, image: d.image || d.images?.[0], images: d.images, price: d.price, category: d.category, brand: d.brand, ageGroup: d.ageGroup, stock: d.stock, rating: d.rating }))
      return res.json({ items: normalized, total })
    } catch (err) {
      // Fallback to in-memory data if DB is unavailable
      let data = [...fallbackProducts]
      const { category, ageGroup, brand, minPrice, maxPrice, rating, q, sort, page = 1, limit = 20 } = req.query
      if (category) data = data.filter(p => p.category === category)
      if (ageGroup) data = data.filter(p => p.ageGroup === ageGroup)
      if (brand) data = data.filter(p => p.brand === brand)
      if (minPrice) data = data.filter(p => p.price >= Number(minPrice))
      if (maxPrice) data = data.filter(p => p.price <= Number(maxPrice))
      if (rating) data = data.filter(p => (p.rating || 0) >= Number(rating))
      if (q) data = data.filter(p => p.name.toLowerCase().includes(String(q).toLowerCase()))
      if (sort === 'price_asc') data.sort((a, b) => a.price - b.price)
      if (sort === 'price_desc') data.sort((a, b) => b.price - a.price)
      if (sort === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0))
      const start = (Number(page) - 1) * Number(limit)
      return res.json({ items: data.slice(start, start + Number(limit)), total: data.length })
    }
  }))

  router.get('/:id', catchAsync(async (req, res) => {
    const { id } = req.params
    try {
      const doc = await Product.findById(id).lean()
      if (!doc) return res.status(404).json({ error: 'Product not found' })
      return res.json({ id: doc._id?.toString(), name: doc.name, description: doc.description, image: doc.image || doc.images?.[0], images: doc.images, price: doc.price, category: doc.category, brand: doc.brand, ageGroup: doc.ageGroup, stock: doc.stock, rating: doc.rating, reviews: doc.reviews })
    } catch (err) {
      const found = fallbackProducts.find(p => p.id === id)
      return found ? res.json(found) : res.status(404).json({ error: 'Product not found' })
    }
  }))

  // Admin CRUD
  router.post('/', authenticate, requireRole('admin', 'superadmin'), productCreateRules, catchAsync(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const doc = await Product.create(req.body)
    res.status(201).json({ id: doc._id?.toString() })
  }))

  router.put('/:id', authenticate, requireRole('admin', 'superadmin'), productUpdateRules, catchAsync(async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
    const { id } = req.params
    const doc = await Product.findByIdAndUpdate(id, req.body, { new: true }).lean()
    if (!doc) return res.status(404).json({ error: 'Product not found' })
    res.json({ ok: true })
  }))

  router.delete('/:id', authenticate, requireRole('admin', 'superadmin'), catchAsync(async (req, res) => {
    const { id } = req.params
    await Product.findByIdAndDelete(id)
    res.json({ ok: true })
  }))

  return router
}