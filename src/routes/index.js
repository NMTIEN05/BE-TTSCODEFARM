import express from "express";
import categoryRouter from "./categoryRoutes.js";
import authorRouter from "./authorRoutes.js";
import bookRouter from "./bookRoutes.js";
import couponRouter from "./couponRoutes.js";
import orderRouter from "./orderRoutes.js";
import orderDetailRouter from "./orderDetailRoutes.js";
import orderCouponRouter from "./orderCouponRoutes.js";
import bookReviewRouter from "./bookReviewRoutes.js";
import cartRouter from "./cartRoutes.js";

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
