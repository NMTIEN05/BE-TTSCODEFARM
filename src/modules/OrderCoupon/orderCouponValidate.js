import Joi from "joi";

export const orderCouponValidate = Joi.object({
  order_id: Joi.string().required().messages({
    "any.required": "order_id là bắt buộc",
    "string.empty": "order_id không được để trống",
  }),
  coupon_id: Joi.string().required().messages({
    "any.required": "coupon_id là bắt buộc",
    "string.empty": "coupon_id không được để trống",
  }),
  discount_amount: Joi.number().required().min(0).messages({
    "any.required": "discount_amount là bắt buộc",
    "number.base": "discount_amount phải là số",
    "number.min": "discount_amount phải >= 0",
  }),
});
