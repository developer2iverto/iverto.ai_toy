import mongoose from 'mongoose'

const OrderItemSchema = new mongoose.Schema({
  // Accept either real Mongo ObjectId (as string) or fallback product IDs like 'p1'
  productId: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false })

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: { type: [OrderItemSchema], required: true },
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: Object, required: true },
  shippingMethod: { type: String, enum: ['standard', 'express'], default: 'standard' },
  shippingCost: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['online', 'cod'], default: 'online' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  orderStatus: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered'], default: 'Pending' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true })

export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema)