// src/modules/User/authRouter.js
import express from "express";
import { register, login, getAllUsers, getUserById, updateUser, deleteUser, verifyEmail, resendVerificationEmail } from "./authController.js";
import { protect, isAdmin, isSelfOrAdmin } from "../../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);

// Các route cần đăng nhập
router.get("/users", protect, isAdmin, getAllUsers);             // Chỉ admin xem tất cả user
router.get("/users/:id", protect, isSelfOrAdmin, getUserById);   // User xem info mình hoặc admin
router.put("/users/:id", protect, isSelfOrAdmin, updateUser);    // Chỉnh sửa user (chính mình hoặc admin)
router.delete("/users/:id", protect, isAdmin, deleteUser);       // Xóa user chỉ admin làm được

export default router;
