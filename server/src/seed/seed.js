import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { sampleProducts } from '../data/products.js'

dotenv.config()

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/baby_toys_store'

async function run() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(uri)
    console.log('Connected.')

    console.log('Clearing existing users and products...')
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({})
    ])

    console.log('Seeding products...')
    const docs = sampleProducts.map(({ name, description, image, price, category }) => ({
      name,
      description,
      images: image ? [image] : [],
      image,
      price,
      category,
      brand: 'PlayfulCo',
      ageGroup: '0-2 years',
      stock: 50,
      rating: 4
    }))
    await Product.insertMany(docs)
    console.log(`Inserted ${docs.length} products.`)

    console.log('Creating admin and superadmin users...')
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.default.hash('admin123', 10)
    const superHash = await bcrypt.default.hash('superadmin123', 10)
    await User.create([
      { email: 'admin@toyshop.local', password: hash, name: 'Product Admin', role: 'admin' },
      { email: 'super@toyshop.local', password: superHash, name: 'Super Admin', role: 'superadmin' },
      { email: 'admin@example.com', password: hash, name: 'Admin Example', role: 'admin' },
      { email: 'superadmin@example.com', password: superHash, name: 'Superadmin Example', role: 'superadmin' }
    ])
    console.log('Admin users created: admin@toyshop.local / super@toyshop.local / admin@example.com / superadmin@example.com')
  } catch (err) {
    console.error('Seed failed:', err)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected.')
  }
}

run()