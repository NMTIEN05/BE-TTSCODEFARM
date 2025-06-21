import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  added_date: { type: Date, default: Date.now },
}, { versionKey: false });

 const Wishlist = mongoose.model("Wishlist", wishlistSchema);
 
export default Wishlist;