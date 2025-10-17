import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  comment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
}, { _id: false })

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, index: true },
  brand: { type: String, default: '' },
  ageGroup: { type: String, index: true },
  images: { type: [String], default: [] },
  image: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  reviews: { type: [ReviewSchema], default: [] },
}, { timestamps: true })

export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema)