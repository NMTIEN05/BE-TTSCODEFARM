import express from "express";
import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategory,
  getCategoryById,
  getCategorys,
  updateCategory,
} from "../controllers/categoryController.js";

const router = express.Router();

// Route kiểm tra kết nối từ frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// Bỏ route đăng ký người dùng /register

// Routes category
routes.get("/categories", getCategorys);
routes.get("/categories/:id", getCategoryById);
routes.delete("/categories/:id", deleteCategory);
routes.post("/categories", createCategory);
routes.put("/categories/:id", updateCategory);

export default routes;
