import express from "express";
import categoryRouter from "../modules/Category/categoryRoutes.js";
import authorRouter from "../modules/Author/authorRoutes.js";
import bookRouter from "../modules/Product/bookRoutes.js";
import couponRouter from "../modules/Coupon/couponRoutes.js";
import orderRouter from "../modules/Order/orderRoutes.js";
import orderDetailRouter from "../modules/OrderDetail/orderDetailRoutes.js";
import orderCouponRouter from "../modules/OrderCoupon/orderCouponRoutes.js";
import bookReviewRouter from "../modules/ProductReview/bookReviewRoutes.js";
import { getCart } from "../modules/Cart/cartController.js";
import { addToCart } from "../modules/CartItem/cartItemController.js";


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
