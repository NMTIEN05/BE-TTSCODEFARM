import Joi from 'joi';

export const wishlistItemValidate = Joi.object({
  book_id: Joi.string().required(),
  quantity: Joi.number().min(1).default(1),
});