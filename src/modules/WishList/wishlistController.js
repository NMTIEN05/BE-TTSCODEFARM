import Wishlist from "./Wishlist.js";
import User from "../User/User.js";
import Book from "../Product/Book.js";
// Thêm sản phẩm vào wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { book_id,user_id } = req.body;
    // const  = req.user._id; // Lấy từ middleware JWT

    //  Validate: user & book tồn tại
    const user = await User.findById(user_id);
    const book = await Book.findById(book_id);
    if (!user || !book) {
      return res.status(404).json({ message: 'User or book not found' });
    }

    //  Check đã có trong wishlist chưa
    const exists = await Wishlist.findOne({ user_id, book_id });
    if (exists) {
      return res.status(400).json({ message: 'Book already in wishlist' });
    }

    //  Tạo mới
    const item = await Wishlist.create({ user_id, book_id });
    return res.status(201).json({ message: 'Added to wishlist', data: item });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Xóa sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    // const user_id = req.user._id;
    // const { book_id } = req.params;
    const { book_id, user_id } = req.body; // Lấy từ body request
    const deleted = await Wishlist.findOneAndDelete({ user_id, book_id });
    if (!deleted) {
      return res.status(404).json({ message: "Book not found in wishlist" });
    }
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};