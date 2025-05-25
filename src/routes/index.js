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



// Category routes
router.get("/categories", getCategorys);
router.get("/categories/:id", getCategoryById);
router.delete("/categories/:id", deleteCategory);
router.post("/categories/add", createCategory);
router.put("/categories/edit/:id", updateCategory);

// Author routes
router.get("/authors", getAuthors);
router.get("/authors/:id", getAuthorById);
router.post("/authors/add", createAuthor);
router.put("/authors/edit/:id", updateAuthor);
router.delete("/authors/:id", deleteAuthor);

// Book routes
router.post("/books/add", createBook);
router.get("/books", getBooks);
router.get("/books/:id", getBookById);
router.put("/books/edit/:id", updateBook);
router.delete("/books/:id", deleteBook);

// Coupon routes
router.get("/coupons", getCoupons);
router.get("/coupons/:id", getCouponById);
router.post("/coupons/add", createCoupon);
router.put("/coupons/edit/:id", updateCoupon);
router.delete("/coupons/:id", deleteCoupon);
router.patch("/coupons/toggle/:id", toggleCouponStatus);

// Order routes
router.get("/orders", getOrders);
router.get("/orders/:id", getOrderById);
router.post("/orders/add", createOrder);
router.put("/orders/edit/:id", updateOrder);
router.delete("/orders/:id", deleteOrder);
router.patch("/orders/status/:id", updateOrderStatus);
router.patch("/orders/cancel/:id", cancelOrder);
router.get("/orders/user/:userId", getUserOrders);

// Order Detail routes
router.get("/order-details", getOrderDetails);
router.get("/order-details/:id", getOrderDetailById);
router.delete("/order-details/:id", deleteOrderDetail);
router.post("/order-details/add", createOrderDetail);
router.put("/order-details/edit/:id", updateOrderDetail);

// Order Coupon routes
router.get("/order-coupons", getOrderCoupons);
router.get("/order-coupons/:id", getOrderCouponById);
router.post("/order-coupons/add", createOrderCoupon);
router.put("/order-coupons/edit/:id", updateOrderCoupon);
router.delete("/order-coupons/:id", deleteOrderCoupon);
router.post("/order-coupons/validate", validateAndApplyCoupon);

// Book Review routes
router.post("/book-reviews/add", createReview);
router.get("/book-review/:book_id", getReviewsByBook);

// Cart routes
router.get("/cart/:user_id", getCart);
router.post("/cart-add", addToCart);

export default router;
