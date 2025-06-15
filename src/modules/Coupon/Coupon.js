import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    discount_type: { type: String, required: true },
    discount_value: { type: Number, required: true },
    min_purchase: { type: Number, default: 0 },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
