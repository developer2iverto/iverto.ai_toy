import { body } from 'express-validator'

export const orderCreateRules = [
  body('products').isArray({ min: 1 }),
  body('products.*.productId').isString(),
  body('products.*.quantity').isInt({ min: 1 }),
  body('products.*.price').isFloat({ gt: 0 }),
  body('shippingAddress').isObject(),
  body('shippingAddress.name').optional().isString(),
  body('shippingAddress.email').optional().isEmail(),
  body('shippingMethod').optional().isIn(['standard','express']),
  body('paymentMethod').optional().isIn(['online','cod'])
]