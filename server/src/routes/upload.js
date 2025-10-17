import express from 'express'
import multer from 'multer'
import path from 'path'
import { authenticate, requireRole } from '../middleware/auth.js'

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(process.cwd(), 'server', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-')
    cb(null, `${base}-${Date.now()}${ext}`)
  }
})

const upload = multer({ storage })
const router = express.Router()

router.post('/', authenticate, requireRole('admin', 'superadmin'), upload.array('images', 5), (req, res) => {
  const base = process.env.PUBLIC_API_URL || `${req.protocol}://${req.get('host')}`
  const urls = (req.files || []).map(f => `${base}/uploads/${f.filename}`)
  res.status(201).json({ urls })
})

export default router