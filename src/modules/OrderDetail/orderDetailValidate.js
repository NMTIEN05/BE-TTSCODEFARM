import Joi from "joi";

export const orderDetailValidate = Joi.object({
  order_id: Joi.string().required().messages({
    "any.required": "order_id là bắt buộc",
    "string.empty": "order_id không được để trống",
  }),
  book_id: Joi.string().required().messages({
    "any.required": "book_id là bắt buộc",
    "string.empty": "book_id không được để trống",
  }),
  // cart_item_id: Joi.string().required().messages({
  //   "any.required": "cart_item_id là bắt buộc",
  //   "string.empty": "cart_item_id không được để trống",
  // }),
  quantity: Joi.number().required().min(1).messages({
    "any.required": "quantity là bắt buộc",
    "number.base": "quantity phải là số",
    "number.min": "quantity phải >= 1",
  }),
  price: Joi.number().required().min(0).messages({
    "any.required": "price là bắt buộc",
    "number.base": "price phải là số",
    "number.min": "price phải >= 0",
  }),
  subtotal: Joi.number().required().min(0).messages({
    "any.required": "subtotal là bắt buộc",
    "number.base": "subtotal phải là số",
    "number.min": "subtotal phải >= 0",
  }),
});
