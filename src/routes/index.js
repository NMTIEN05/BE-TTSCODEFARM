import express from "express";
import categoryRouter from "../modules/Category/categoryRoutes.js";
import authorRouter from "../modules/Author/authorRoutes.js";
import bookRouter from "../modules/Product/bookRoutes.js";
import couponRouter from "../modules/Coupon/couponRoutes.js";
import orderRouter from "../modules/Order/orderRoutes.js";
import returnRequestRouter from "../modules/Order/returnRequestRoutes.js";
import orderDetailRouter from "../modules/OrderDetail/orderDetailRoutes.js";
import orderCouponRouter from "../modules/OrderCoupon/orderCouponRoutes.js";
import bookReviewRouter from "../modules/ProductReview/bookReviewRoutes.js";
import wishlistRouter from "../modules/WishList/wishlistRouter.js";
import cartRouter from "../modules/Cart/cartRoutes.js";
import variantRouter from "../modules/ProductVariant/productVariantRoutes.js";
import flashSaleRouter from "../modules/FlashSale/flashSaleRoutes.js";
import vnpayRouter from "../modules/Payment/vnpayRoutes.js";
import contactRouter from "../modules/Contact/contact.routes.js";


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
router.use("", returnRequestRouter);

// Order Detail routes
router.use("", orderDetailRouter);

// Order Coupon routes
router.use("", orderCouponRouter);

// Book Review routes
router.use("", bookReviewRouter);

// Wishlist routes
router.use("/wishlist", wishlistRouter);

// Cart routes
router.use("", cartRouter);

// Variant routes
router.use("/variants", variantRouter);

// Flash Sale routes
router.use("/flashsales", flashSaleRouter);

// VNPay routes
router.use("/payment", vnpayRouter);

// Contact routes
router.use("/contact", contactRouter);

export default router;
