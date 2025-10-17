import express from 'express'
import mongoose from 'mongoose'
import { authenticate, requireRole } from '../middleware/auth.js'
import { Setting } from '../models/Setting.js'

// Fallback in-memory settings if DB disconnected
let memorySettings = {
  siteName: 'Baby Toys Store',
  logoUrl: '',
  brandColor: '#ef4444',
  bannerEnabled: false,
  bannerText: ''
}

const router = express.Router()

// Ensure a single Settings document exists
async function ensureDoc() {
  if (mongoose.connection.readyState !== 1) return null
  let doc = await Setting.findOne().lean()
  if (!doc) {
    doc = await Setting.create(memorySettings)
  }
  return doc
}

// Public settings for client header/banner
router.get('/public', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memorySettings)
    }
    const doc = await ensureDoc()
    const { siteName, logoUrl, brandColor, bannerEnabled, bannerText } = doc
    res.json({ siteName, logoUrl, brandColor, bannerEnabled, bannerText })
  } catch (err) { next(err) }
})

// Admin view of settings (superadmin only)
router.get('/', authenticate, requireRole('superadmin'), async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json(memorySettings)
    }
    const doc = await ensureDoc()
    res.json(doc)
  } catch (err) { next(err) }
})

// Update settings (superadmin only)
router.put('/', authenticate, requireRole('superadmin'), async (req, res, next) => {
  try {
    const payload = {
      siteName: req.body.siteName ?? memorySettings.siteName,
      logoUrl: req.body.logoUrl ?? memorySettings.logoUrl,
      brandColor: req.body.brandColor ?? memorySettings.brandColor,
      bannerEnabled: req.body.bannerEnabled ?? memorySettings.bannerEnabled,
      bannerText: req.body.bannerText ?? memorySettings.bannerText,
    }
    if (mongoose.connection.readyState !== 1) {
      memorySettings = { ...memorySettings, ...payload }
      return res.json(memorySettings)
    }
    const doc = await ensureDoc()
    const updated = await Setting.findByIdAndUpdate(doc._id, payload, { new: true }).lean()
    res.json(updated)
  } catch (err) { next(err) }
})

export default router