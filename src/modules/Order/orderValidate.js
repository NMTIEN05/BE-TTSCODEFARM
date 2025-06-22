import Joi from "joi";

export const orderValidate = Joi.object({
  user_id: Joi.string().optional().allow(null).messages({
    "string.empty": "user_id không được để trống",
  }),
  cart_id: Joi.string().optional().allow(null).messages({
    "string.empty": "cart_id không được để trống",
  }),
  total_amount: Joi.number().required().min(0).messages({
    "any.required": "total_amount là bắt buộc",
    "number.base": "total_amount phải là số",
    "number.min": "total_amount phải >= 0",
  }),
  shipping_address: Joi.string().required().messages({
    "any.required": "shipping_address là bắt buộc",
    "string.empty": "shipping_address không được để trống",
  }),
  payment_method: Joi.string().required().messages({
    "any.required": "payment_method là bắt buộc",
    "string.empty": "payment_method không được để trống",
  }),
  shipping_fee: Joi.number().min(0).optional().messages({
    "number.base": "shipping_fee phải là số",
    "number.min": "shipping_fee phải >= 0",
  }),
  tax: Joi.number().min(0).optional().messages({
    "number.base": "tax phải là số",
    "number.min": "tax phải >= 0",
  }),
  status: Joi.string()
    .optional()
    .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
    .messages({
      "any.only": "status không hợp lệ",
    }),
  details: Joi.array()
    .items(
      Joi.object({
        book_id: Joi.string().required().messages({
          "any.required": "book_id là bắt buộc",
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          "any.required": "quantity là bắt buộc",
        }),
        price: Joi.number().min(0).required().messages({
          "any.required": "price là bắt buộc",
        }),
        cart_item_id: Joi.string().optional(),
      })
    )
    .optional(),
  coupons: Joi.array()
    .items(
      Joi.object({
        coupon_id: Joi.string().required().messages({
          "any.required": "coupon_id là bắt buộc",
        }),
        discount_amount: Joi.number().min(0).required().messages({
          "any.required": "discount_amount là bắt buộc",
        }),
      })
    )
    .optional(),
});
