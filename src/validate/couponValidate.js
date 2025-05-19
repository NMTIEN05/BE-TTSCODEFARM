import Joi from "joi";

export const couponValidate = Joi.object({
  code: Joi.string().trim().min(3).max(20).required().messages({
    "string.empty": "Mã giảm giá không được để trống",
    "string.min": "Mã giảm giá phải có ít nhất 3 ký tự",
    "string.max": "Mã giảm giá không được vượt quá 20 ký tự",
    "any.required": "Mã giảm giá là bắt buộc",
  }),
  discount_type: Joi.string().valid("percentage", "fixed").required().messages({
    "any.only": "Loại giảm giá phải là 'percentage' hoặc 'fixed'",
    "any.required": "Loại giảm giá là bắt buộc",
  }),
  discount_value: Joi.number().positive().required().messages({
    "number.base": "Giá trị giảm giá phải là số",
    "number.positive": "Giá trị giảm giá phải lớn hơn 0",
    "any.required": "Giá trị giảm giá là bắt buộc",
  }),
  min_purchase: Joi.number().min(0).default(0).messages({
    "number.base": "Giá trị mua tối thiểu phải là số",
    "number.min": "Giá trị mua tối thiểu không được âm",
  }),
  start_date: Joi.date().required().messages({
    "date.base": "Ngày bắt đầu không hợp lệ",
    "any.required": "Ngày bắt đầu là bắt buộc",
  }),
  end_date: Joi.date().greater(Joi.ref("start_date")).required().messages({
    "date.greater": "Ngày kết thúc phải sau ngày bắt đầu",
    "any.required": "Ngày kết thúc là bắt buộc",
  }),
  is_active: Joi.boolean().default(true),
});
