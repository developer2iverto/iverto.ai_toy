import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import { registerRules, loginRules } from '../validators/auth.js'
import { User } from '../models/User.js'
import catchAsync from '../utils/catchAsync.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', registerRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const email = (req.body.email || '').trim().toLowerCase()
  const password = req.body.password
  const name = (req.body.name || '').trim()
  const existing = await User.findOne({ email })
  if (existing) return res.status(409).json({ error: 'Email already registered' })
  const hashed = await bcrypt.hash(password, 10)
  const user = await User.create({ email, password: hashed, name })
  const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email, name: user.name }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  res.status(201).json({ token, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } })
}))

router.post('/login', loginRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const email = (req.body.email || '').trim().toLowerCase()
  const password = req.body.password
  const user = await User.findOne({ email })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' })
  const token = jwt.sign({ id: user._id.toString(), role: user.role, email: user.email, name: user.name }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' })
  res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name, role: user.role } })
}))

router.get('/me', authenticate, catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id).lean()
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ id: user._id.toString(), email: user.email, name: user.name, role: user.role, avatar: user.avatar })
}))

export default router