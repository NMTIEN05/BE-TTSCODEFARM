import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount_percent: { type: Number, required: true, min: 1, max: 100 },
    min_purchase: { type: Number, default: 0 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
    deleted_at: {
      type: Date,
      default: null,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
