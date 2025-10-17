import mongoose from 'mongoose'

const CartItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 }
}, { _id: false })

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  items: { type: [CartItemSchema], default: [] }
}, { timestamps: true })

export const Cart = mongoose.models.Cart || mongoose.model('Cart', CartSchema)