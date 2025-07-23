import mongoose from "mongoose";

const productVariantSchema = new mongoose.Schema(
  {
    book_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    format: {
      type: String,
      enum: ['hardcover', 'paperback', 'pdf'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    // Thông tin riêng cho format vật lý
    pages: {
      type: Number,
      required: function() { return this.format !== 'pdf'; }
    },
    weight: {
      type: Number, // gram
      required: function() { return this.format !== 'pdf'; }
    },
    dimensions: {
      length: { type: Number }, // cm
      width: { type: Number },  // cm
      height: { type: Number }  // cm
    },
    // Thông tin riêng cho PDF
    file_size: {
      type: Number, // MB
      required: function() { return this.format === 'pdf'; }
    },
    file_format: {
      type: String,
      enum: ['PDF', 'EPUB', 'MOBI'],
      required: function() { return this.format === 'pdf'; }
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productVariantSchema.index({ book_id: 1, format: 1 }, { unique: true });

const ProductVariant = mongoose.model("ProductVariant", productVariantSchema);
export default ProductVariant;