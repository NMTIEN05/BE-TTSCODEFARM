import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: 'active' },
}, { timestamps: true, versionKey: false });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart