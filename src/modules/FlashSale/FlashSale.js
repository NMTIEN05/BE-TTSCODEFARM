import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

flashSaleSchema.index({ startDate: 1, endDate: 1 });
flashSaleSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model('FlashSale', flashSaleSchema);