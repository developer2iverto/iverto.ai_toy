import { body } from 'express-validator'

export const updateRoleRules = [
  body('role').isIn(['customer', 'admin', 'superadmin'])
]