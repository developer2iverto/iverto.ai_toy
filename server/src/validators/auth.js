import { body } from 'express-validator'

export const registerRules = [
  body('email').trim().isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 2 })
]

export const loginRules = [
  body('email').trim().isEmail(),
  body('password').isLength({ min: 6 })
]