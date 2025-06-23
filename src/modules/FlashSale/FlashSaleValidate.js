const Joi = require('joi')
const { StatusCodes } = require('http-status-codes')
const ApiError = require('../utils/ApiError')

// Tạo flash sale
const createFlashSaleValidation = async (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Tên không được để trống',
      'any.required': 'Tên là trường bắt buộc'
    }),
    description: Joi.string().allow('').optional(),
    startDate: Joi.date().iso().required().messages({
      'date.base': 'startDate phải là ngày hợp lệ',
      'any.required': 'startDate là trường bắt buộc'
    }),
    endDate: Joi.date().iso().required().messages({
      'date.base': 'endDate phải là ngày hợp lệ',
      'any.required': 'endDate là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error?.message || 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

// Lấy danh sách flash sale
const fetchAllFlashSaleValidation = async (req, res, next) => {
  const schema = Joi.object({
    current: Joi.number().optional().default(1).min(1),
    pageSize: Joi.number().optional().default(10).min(1).max(100),
    qs: Joi.string().optional()
  })

  try {
    await schema.validateAsync(req.query, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error?.message || 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

// Lấy flash sale theo ID
const fetchInfoFlashSaleValidation = async (req, res, next) => {
  const schema = Joi.object({
    flashSaleId: Joi.string().trim().length(24).hex().required().label('flashSaleId').messages({
      'string.base': 'flashSaleId phải là chuỗi',
      'string.length': 'flashSaleId phải có độ dài 24 ký tự',
      'string.hex': 'flashSaleId phải là chuỗi hex hợp lệ',
      'any.required': 'flashSaleId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error?.message || 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

// Cập nhật flash sale
const updateFlashSaleValidation = async (req, res, next) => {
  const paramsSchema = Joi.object({
    flashSaleId: Joi.string().trim().length(24).hex().required().label('flashSaleId').messages({
      'string.base': 'flashSaleId phải là chuỗi',
      'string.length': 'flashSaleId phải có độ dài 24 ký tự',
      'string.hex': 'flashSaleId phải là chuỗi hex hợp lệ',
      'any.required': 'flashSaleId là trường bắt buộc'
    })
  })

  const bodySchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().allow('').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
  })

  try {
    await paramsSchema.validateAsync(req.params, { abortEarly: false })
    await bodySchema.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error?.message || 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

// Xoá flash sale
const deleteFlashSaleValidation = async (req, res, next) => {
  const schema = Joi.object({
    flashSaleId: Joi.string().trim().length(24).hex().required().label('flashSaleId').messages({
      'string.base': 'flashSaleId phải là chuỗi',
      'string.length': 'flashSaleId phải có độ dài 24 ký tự',
      'string.hex': 'flashSaleId phải là chuỗi hex hợp lệ',
      'any.required': 'flashSaleId là trường bắt buộc'
    })
  })

  try {
    await schema.validateAsync(req.params, { abortEarly: false })
    next()
  } catch (error) {
    const errorMessage = error?.message || 'Có lỗi xảy ra trong quá trình xử lý'
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errorMessage))
  }
}

// Export tất cả validations
module.exports = {
  createFlashSaleValidation,
  fetchAllFlashSaleValidation,
  fetchInfoFlashSaleValidation,
  updateFlashSaleValidation,
  deleteFlashSaleValidation
}
