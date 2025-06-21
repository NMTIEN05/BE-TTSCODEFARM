import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    total_amount: { type: Number, required: true },
    status: { type: String, default: "pending" },
    order_date: { type: Date, default: Date.now },
    shipping_address: { type: String, required: true },
    payment_method: { type: String, required: true },
    shipping_fee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
