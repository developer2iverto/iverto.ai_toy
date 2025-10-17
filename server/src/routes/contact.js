import express from 'express'
import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import { contactCreateRules } from '../validators/contact.js'
import { ContactMessage } from '../models/ContactMessage.js'
import catchAsync from '../utils/catchAsync.js'

const router = express.Router()

// In-memory fallback when DB disconnected
const inMemoryMessages = []

// Public: submit a contact message
router.post('/', contactCreateRules, catchAsync(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
  const payload = {
    name: (req.body.name || '').trim(),
    email: (req.body.email || '').trim().toLowerCase(),
    message: (req.body.message || '').trim()
  }
  if (mongoose.connection.readyState !== 1) {
    inMemoryMessages.unshift({ id: Math.random().toString(36).slice(2), ...payload, createdAt: new Date() })
    return res.status(201).json({ ok: true })
  }
  await ContactMessage.create(payload)
  res.status(201).json({ ok: true })
}))

export default router