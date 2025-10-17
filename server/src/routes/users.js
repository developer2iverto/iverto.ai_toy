import express from 'express'
import { authenticate, requireRole } from '../middleware/auth.js'
import { User } from '../models/User.js'
import { updateRoleRules } from '../validators/users.js'
import { validationResult } from 'express-validator'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router()

router.get('/', authenticate, requireRole('superadmin'), catchAsync(async (req, res) => {
  const users = await User.find().lean()
  res.json(users.map(u => ({ id: u._id?.toString(), email: u.email, name: u.name, role: u.role })))
}))

router.delete('/:id', authenticate, requireRole('superadmin'), catchAsync(async (req, res) => {
  const { id } = req.params
  await User.findByIdAndDelete(id)
  res.json({ ok: true })
}))

router.put('/:id/role', authenticate, requireRole('superadmin'), updateRoleRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const { id } = req.params
  const { role } = req.body
  const user = await User.findByIdAndUpdate(id, { role }, { new: true }).lean()
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json({ ok: true })
}))

export default router