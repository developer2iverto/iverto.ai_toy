import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import fs from 'fs'
import path from 'path'
import productsRouter, { fallbackProducts } from './routes/products.js'
import authRouter from './routes/auth.js'
import cartRouter from './routes/cart.js'
import ordersRouter from './routes/orders.js'
import paymentsRouter from './routes/payments.js'
import usersRouter from './routes/users.js'
import uploadRouter from './routes/upload.js'
import settingsRouter from './routes/settings.js'
import offersRouter from './routes/offers.js'
import contactRouter from './routes/contact.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 5000
const ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'
// Allow any dev origin; set FRONTEND_ORIGIN in production for stricter CORS
// Allow images and static assets to be loaded cross-origin from the frontend dev server
// Disable CORP header entirely to avoid preview environment blocking
app.use(helmet({ crossOriginResourcePolicy: false }))
app.use(cors({ origin: true }))
app.use(express.json())
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }))

// Ensure uploads dir exists and serve static files
const uploadsDir = path.join(process.cwd(), 'server', 'uploads')
try { fs.mkdirSync(uploadsDir, { recursive: true }) } catch {}
app.use('/uploads', express.static(uploadsDir))

let dbConnected = false
const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/baby_toys_store'

mongoose.connect(uri).then(() => {
  dbConnected = true
  console.log('MongoDB connected')
}).catch(err => {
  dbConnected = false
  console.log('MongoDB connection failed, using fallback data. Error:', err.message)
})

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'Baby Toys Store API', dbConnected })
})

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter({ dbConnected }))
app.use('/api/cart', cartRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/payments', paymentsRouter)
app.use('/api/users', usersRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/offers', offersRouter)
app.use('/api/contact', contactRouter)

// Fallback route to show something even if DB is down
app.get('/api/preview-products', (req, res) => {
  res.json(fallbackProducts)
})

// Error handling
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`))