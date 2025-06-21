import Joi from "joi";

export const BookValidate = Joi.object({
  category_id: Joi.string().required().messages({
    "string.empty": "Danh mục là bắt buộc",
    "any.required": "Danh mục là bắt buộc",
  }),
  title: Joi.string().required().trim().messages({
    "string.empty": "Tiêu đề sách là bắt buộc",
    "any.required": "Tiêu đề sách là bắt buộc",
  }),
  author_id: Joi.string().required().messages({
    "string.empty": "Tác giả là bắt buộc",
    "any.required": "Tác giả là bắt buộc",
  }),
  publisher: Joi.string().trim().allow("").optional(),
  publish_year: Joi.alternatives()
    .try(Joi.date(), Joi.string().isoDate())
    .optional()
    .messages({
      "date.base": "Năm xuất bản phải là ngày hợp lệ",
      "string.isoDate": "Năm xuất bản phải đúng định dạng ngày (YYYY-MM-DD)",
    }),
  description: Joi.string().trim().allow("").optional(),
  price: Joi.number().min(0).required().messages({
    "number.base": "Giá phải là số",
    "number.min": "Giá không được âm",
    "any.required": "Giá là bắt buộc",
  }),
  stock_quantity: Joi.number().min(0).required().messages({
    "number.base": "Số lượng tồn kho phải là số",
    "number.min": "Số lượng tồn kho không được âm",
    "any.required": "Số lượng tồn kho là bắt buộc",
  }),
  cover_image: Joi.string().trim().allow("").optional(),
  is_available: Joi.boolean().default(true),
});
