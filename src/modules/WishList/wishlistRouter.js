import express from "express";
import { protect } from "../../middlewares/auth.js";
import { addToWishlist, removeFromWishlist } from "./wishlistController.js";

const router = express.Router();

// Thêm sách vào wishlist
router.post("/", addToWishlist);

// Xóa sách khỏi wishlist
router.delete("/:book_id", removeFromWishlist);

export default router;