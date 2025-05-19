import Joi from "joi";

export const categoryValidate = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên danh mục không được để trống",
    "any.required": "Tên danh mục là bắt buộc",
  }),
  description: Joi.string().required().min(10).messages({
    "string.empty": "Mô tả không được để trống",
    "any.required": "Mô tả là bắt buộc",
    "string.min": "Mô tả phải có ít nhất 10 ký tự",
  }),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
});
