import express from "express";
import { protect } from "../../middlewares/auth.js";
import { addToWishlist, removeFromWishlist, getWishlist, checkWishlist } from "./wishlistController.js";

const router = express.Router();

// Lấy danh sách wishlist
router.get("/user/:user_id", getWishlist);

// Kiểm tra sản phẩm trong wishlist
router.get("/check/:user_id/:book_id", checkWishlist);

// Thêm sách vào wishlist
router.post("/add", addToWishlist);

// Xóa sách khỏi wishlist
router.delete("/remove", removeFromWishlist);

export default router;