import mongoose from 'mongoose'
import mongooseDelete from 'mongoose-delete'

const FlashSaleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    createdBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String }
    },
    updatedBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String }
    },
    deletedBy: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      email: { type: String }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

FlashSaleSchema.plugin(mongooseDelete, {
  overrideMethods: 'all',
  deletedAt: true,
  deletedBy: true
})

const FlashSale = mongoose.model('FlashSale', FlashSaleSchema)
export default FlashSale
