import express from 'express'
import { sampleOffers } from '../data/offers.js'

const router = express.Router()

// Public: list available offers
router.get('/', (req, res) => {
  // In this simple implementation we return in-memory offers.
  // If needed, this can later be backed by DB documents.
  res.json(sampleOffers)
})

export default router