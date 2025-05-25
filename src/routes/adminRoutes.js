import express from "express";
// Đúng:
import User from "../model/User.js";

import { protect, isAdmin } from "../middlewares/auth.js";

const router = express.Router();

// Lấy danh sách người dùng - chỉ admin
router.get("/users", protect, isAdmin, async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

export default router;
