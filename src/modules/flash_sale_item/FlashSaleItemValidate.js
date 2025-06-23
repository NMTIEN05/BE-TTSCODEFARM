import Joi from 'joi'

export const flashSaleItemValidate = {
  create: Joi.object({
    flash_sale_id: Joi.string().length(24).hex().required().label('Flash sale ID'),
    product_id: Joi.string().length(24).hex().required().label('Product ID'),
    price: Joi.number().positive().required().label('Giá khuyến mãi'),
    quantity: Joi.number().integer().positive().required().label('Số lượng áp dụng'),
    start_time: Joi.date().required().label('Thời gian bắt đầu'),
    end_time: Joi.date().greater(Joi.ref('start_time')).required().label('Thời gian kết thúc')
  }),

  update: Joi.object({
    price: Joi.number().positive().label('Giá khuyến mãi'),
    quantity: Joi.number().integer().positive().label('Số lượng áp dụng'),
    start_time: Joi.date().label('Thời gian bắt đầu'),
    end_time: Joi.date().greater(Joi.ref('start_time')).label('Thời gian kết thúc'),
    is_active: Joi.boolean().label('Kích hoạt')
  })
}
