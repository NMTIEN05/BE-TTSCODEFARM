import express from "express";
import jwtMiddleware from "../middlewares/jwt.middleware.js";
import {
  createCategory,
  deleteCategory,
  getCategorys,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../controllers/authorController.js";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "../controllers/bookController.js";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
} from "../controllers/couponController.js";
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  getUserOrders,
  updateOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import {
  createOrderDetail,
  deleteOrderDetail,
  getOrderDetailById,
  getOrderDetails,
  updateOrderDetail,
} from "../controllers/orderDetailController.js";
import { createOrderCoupon, getOrderCouponById, getOrderCoupons, updateOrderCoupon } from "../controllers/orderCouponController.js";
import { createReview } from "../controllers/bookReviewController.js";
const router = express.Router();

// Route kiểm tra kết nối từ frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// Bỏ route đăng ký người dùng /register

// router category
router.get("/categories", getCategorys);
router.get("/categories/:id", getCategoryById);
router.delete("/categories/:id", deleteCategory);
router.post("/categories/add", createCategory);
router.put("/categories/edit/:id", updateCategory);

// Authors router
router.get("/authors", getAuthors);
router.get("/authors/:id", getAuthorById);
router.post("/authors/add", createAuthor);
router.put("/authors/edit/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

// Books router
router.post("/books/add", createBook);
router.get("/books", getBooks);
router.get("/books/:id", getBookById);
router.put("/books/edit/:id", updateBook);
router.delete("/books/:id", deleteBook);

// Coupons router
router.get("/coupons", getCoupons);
router.get("/coupons/:id", getCouponById);
router.post("/coupons/add", createCoupon);
router.put("/coupons/edit/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.patch("/coupons/toggle/:id", toggleCouponStatus);

// Orders
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders/add", createOrder);
router.put("/orders/edit/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);
router.patch("/orders/status/:id", updateOrderStatus);
router.patch("/orders/cancel/:id", cancelOrder);
router.get("/orders/user/:userId", getUserOrders);

// Order Details
router.get("/order-details", getOrderDetails);
router.get("/order-details/:id", getOrderDetailById);
router.delete("/order-details/:id", deleteOrderDetail);
router.post("/order-details/add", createOrderDetail);
router.put("/order-details/edit/:id", updateOrderDetail);

// Order Coupons
router.get("/order-coupons", getOrderCoupons);
router.get("/order-coupons/:id", getOrderCouponById);
router.post("/order-coupons/add", createOrderCoupon);
router.put("/order-coupons/edit/:id", updateOrderCoupon);

// Book Review
router.post("/Book/review",createReview);

export default router;
