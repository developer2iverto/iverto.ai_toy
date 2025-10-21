import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await Product.deleteMany()
  await Product.insertMany([
    { name: 'Toy Car', price: 299, category: 'Vehicles' },
    { name: 'Doll House', price: 899, category: 'Playsets' },
  ])
  console.log('✅ Sample products seeded')
  process.exit()
})
