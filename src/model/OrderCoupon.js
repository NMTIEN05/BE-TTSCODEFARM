import mongoose from "mongoose";

const orderCouponSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon", required: true },
  discount_amount: { type: Number, required: true },
}, { versionKey: false });

const OrderCoupon = mongoose.model("OrderCoupon", orderCouponSchema);

 export default OrderCoupon