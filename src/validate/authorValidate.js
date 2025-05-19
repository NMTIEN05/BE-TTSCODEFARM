import Joi from "joi";

export const authorValidate = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Tên tác giả không được để trống",
    "any.required": "Tên tác giả là bắt buộc",
  }),
  bio: Joi.string().required().min(10).messages({
    "string.empty": "Tiểu sử không được để trống",
    "any.required": "Tiểu sử là bắt buộc",
    "string.min": "Tiểu sử phải có ít nhất 10 ký tự",
  }),
  birth_date: Joi.date().required().messages({
    "date.base": "Ngày sinh không hợp lệ",
    "date.format": "Ngày sinh không hợp lệ",
    "date.empty": "Ngày sinh không được để trống",
    "any.required": "Ngày sinh là bắt buộc",
  }),
  nationality: Joi.string().required().messages({
    "string.empty": "Quốc tịch không được để trống",
    "any.required": "Quốc tịch là bắt buộc",
  }),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
});
