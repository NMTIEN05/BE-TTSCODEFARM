import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategorys,
  getCategoryById,
  getCategorys,
  updateCategory,
} from "../controllers/categoryController.js";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../controllers/authorController.js";

const routes = express.Router();

// Route kiểm tra kết nối từ frontend
routes.get("/ping", (req, res) => {
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

// Authors routes
routes.get("/authors", getAuthors);
routes.get("/authors/:id", getAuthorById);
routes.post("/authors/add", createAuthor);
routes.put("/authors/edit/:id", updateAuthor);
routes.delete("/authors/:id", deleteAuthor);

export default routes;
