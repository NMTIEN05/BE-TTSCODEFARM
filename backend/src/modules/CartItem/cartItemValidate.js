import Joi from "joi";

export const cartItemValidate = Joi.object({
  book_id: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
});