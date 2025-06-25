import mongoose from 'mongoose';

const flashSaleItemSchema = new mongoose.Schema({
  flashSaleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FlashSale',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductVariant',
    default: null
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 1,
    max: 99
  }
}, {
  timestamps: true
});

flashSaleItemSchema.index({ flashSaleId: 1 });
flashSaleItemSchema.index({ productId: 1 });

export default mongoose.model('FlashSaleItem', flashSaleItemSchema);