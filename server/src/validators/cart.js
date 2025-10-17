import { body } from 'express-validator'

export const addToCartRules = [
  body('productId').isString(),
  body('quantity').optional().isInt({ min: 1 })
]

export const updateCartRules = [
  body('productId').isString(),
  body('quantity').isInt({ min: 1 })
]