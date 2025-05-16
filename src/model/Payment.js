import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  amount: { type: Number, required: true },
  payment_method: { type: String, required: true, enum: ['vnpay', 'cod', 'momo'] },
  status: { type: String, default: 'pending', enum: ['pending', 'success', 'failed'] },
  payment_date: { type: Date, default: Date.now },
  transaction_id: { type: String },
}, { versionKey: false });

const Payment = mongoose.model("Payment", paymentSchema);
 export default Payment