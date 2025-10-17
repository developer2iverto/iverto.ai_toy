import { body } from 'express-validator'

export const productCreateRules = [
  body('name').isLength({ min: 2 }),
  body('price').isFloat({ gt: 0 }),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('brand').optional().isString(),
  body('ageGroup').optional().isString(),
  body('images').optional().isArray(),
  body('stock').optional().isInt({ min: 0 })
]

export const productUpdateRules = [
  body('name').optional().isLength({ min: 2 }),
  body('price').optional().isFloat({ gt: 0 }),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('brand').optional().isString(),
  body('ageGroup').optional().isString(),
  body('images').optional().isArray(),
  body('stock').optional().isInt({ min: 0 })
]