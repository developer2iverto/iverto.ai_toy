import mongoose from 'mongoose'

const settingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Baby Toys Store' },
  logoUrl: { type: String, default: '' },
  brandColor: { type: String, default: '#ef4444' },
  bannerEnabled: { type: Boolean, default: false },
  bannerText: { type: String, default: '' },
}, { timestamps: true })

export const Setting = mongoose.models.Setting || mongoose.model('Setting', settingSchema)