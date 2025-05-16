
import mongoose from "mongoose";
const cartItemSchema = new mongoose.Schema({
  cart_id: { type: mongoose.Schema.Types.ObjectId, ref: "Cart", required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  quantity: { type: Number, default: 1, required: true },
  price: { type: Number, required: true },
  added_at: { type: Date, default: Date.now },
}, { versionKey: false });

const CartItem = mongoose.model("CartItem", cartItemSchema);

 export default CartItem;