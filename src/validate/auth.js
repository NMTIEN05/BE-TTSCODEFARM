// schemas/auth.schema.ts
import Joi from 'joi';

export const registerSchema = Joi.object({
  fullname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string().min(7).required(),
  isAdmin: Joi.boolean().optional()
});
