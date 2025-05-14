import mongoose from "mongoose";

const orderDetailSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  cart_item_id: { type: mongoose.Schema.Types.ObjectId, ref: "CartItem", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  subtotal: { type: Number, required: true },
}, { versionKey: false });

const OrderDetail =  mongoose.model("OrderDetail", orderDetailSchema);

 export default OrderDetail