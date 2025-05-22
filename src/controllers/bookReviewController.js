import BookReview from "../model/BookReview.js";
import Book from "../model/Book.js";
import UserModel from "../model/User.js";
import { reviewValidate } from "../validate/reviewValidate.js";

export const createReview = async (req, res) => {
  const { user_id, book_id, rating, comment } = req.body;
  // const user_id = req.user_id; // Lấy từ middleware xác thực (JWT)
  try {
    const { error } = reviewValidate.validate({
      book_id,
      user_id,
      rating,
      comment,
    });
    if (error) {
      return res.error(error.details.map((err) => err.message));
    }
    // Kiểm tra người dùng có tồn tại
    const book = await Book.findById(book_id);
    const user = await UserModel.findById(user_id);
    if (!book || !user) {
      return res.error("Sách hoặc người dùng không tồn tại", 404);
    }
    // Kiểm tra người dùng đã đánh giá sách chưa
    const existingReview = await BookReview.findOne({ book_id, user_id });
    if (existingReview) {
      return res.error("Bạn đã đánh giá sản phẩm này rồi", 400);
    }
    // Tạo đánh giá mới
    const review = await BookReview.create({
      book_id,
      user_id,
      rating,
      comment,
      review_date: new Date(),
    });
    return res.success({ data: review }, "Thêm đánh giá thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi đánh giá ", 500);
  }
};
