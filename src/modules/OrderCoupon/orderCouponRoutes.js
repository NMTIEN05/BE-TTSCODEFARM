import express from "express";
import {
  createOrderCoupon,
  deleteOrderCoupon,
  getOrderCouponById,
  getOrderCoupons,
  updateOrderCoupon,
  validateAndApplyCoupon,
} from "./orderCouponController.js";

const orderCouponRouter = express.Router();

orderCouponRouter.get("/order-coupons", getOrderCoupons);
orderCouponRouter.get("/order-coupons/:id", getOrderCouponById);
orderCouponRouter.post("/order-coupons/add", createOrderCoupon);
orderCouponRouter.put("/order-coupons/edit/:id", updateOrderCoupon);
orderCouponRouter.delete("/order-coupons/:id", deleteOrderCoupon);
orderCouponRouter.post("/order-coupons/validate", validateAndApplyCoupon);

export default orderCouponRouter;
