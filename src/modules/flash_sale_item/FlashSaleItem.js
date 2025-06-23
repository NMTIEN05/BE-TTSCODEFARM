const mongoose = require('mongoose')

const flashSaleItemSchema = new mongoose.Schema(
  {
    flash_sale_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashSale',
      required: true
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    sale_price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('FlashSaleItem', flashSaleItemSchema)
