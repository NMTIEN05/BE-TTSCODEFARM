import mongoose from "mongoose";

const bookReviewSchema = new mongoose.Schema({
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true },
  comment: { type: String },
  review_date: { type: Date, default: Date.now },
}, { versionKey: false });

const BookReview = mongoose.model("BookReview", bookReviewSchema);

 export default BookReview;