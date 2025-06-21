import express from "express";
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
import {
  createOrderCoupon,
  deleteOrderCoupon,
  getOrderCouponById,
  getOrderCoupons,
  updateOrderCoupon,
  validateAndApplyCoupon,
} from "../controllers/orderCouponController.js";

import { createReview, getReviewsByBook } from "../controllers/bookReviewController.js";
import { getCart } from "../controllers/cartController.js";
import { addToCart } from "../controllers/cartItemController.js";


const router = express.Router();

// Route kiểm tra kết nối từ frontend
router.get("/ping", (req, res) => {
  console.log("Frontend đã kết nối thành công");
  res.json({ message: "Backend kết nối thành công!" });
});

// router category
router.use("", categoryRouter);

// Author routes
router.use("", authorRouter);

// Book routes
router.use("", bookRouter);

// Coupon routes
router.use("", couponRouter);

// Order routes
router.use("", orderRouter);

// Order Detail routes
router.use("", orderDetailRouter);

// Order Coupon routes
router.use("", orderCouponRouter);

// Book Review routes
router.use("", bookReviewRouter);

// Cart routes
router.get("/cart/:user_id", getCart);
router.post("/cart-add", addToCart);

export default router;
