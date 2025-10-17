import { body } from 'express-validator'

export const contactCreateRules = [
  body('name').isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').isLength({ min: 10, max: 1000 }).withMessage('Message should be 10–1000 characters')
]