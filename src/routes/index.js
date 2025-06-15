import express from "express";
import categoryRouter from "../modules/Category/categoryRoutes";
import authorRouter from "../modules/Author/authorRoutes";
import bookRouter from "../modules/Book/bookRoutes";
import couponRouter from "../modules/Coupon/couponRoutes";
import orderRouter from "../modules/Order/orderRoutes";
import orderDetailRouter from "../modules/OrderDetail/orderDetailRoutes";
import orderCouponRouter from "../modules/OrderCoupon/orderCouponRoutes";
import bookReviewRouter from "../modules/BookReview/bookReviewRoutes";
import cartRouter from "../modules/Cart/cartRoutes";

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
router.use("", cartRouter);

export default router;
