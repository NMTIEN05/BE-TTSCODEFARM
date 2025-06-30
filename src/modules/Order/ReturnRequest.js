import mongoose from "mongoose";

const returnRequestSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending" 
    },
    admin_note: { 
      type: String 
    },
    processed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    processed_at: {
      type: Date
    }
  },
  { timestamps: true, versionKey: false }
);

const ReturnRequest = mongoose.model("ReturnRequest", returnRequestSchema);
export default ReturnRequest;