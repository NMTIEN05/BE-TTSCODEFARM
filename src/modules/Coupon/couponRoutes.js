import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
  restoreCoupon,
  forceDeleteCoupon,
} from "./couponController.js";

const couponRouter = express.Router();

couponRouter.get("/coupons", getCoupons);
couponRouter.get("/coupons/:id", getCouponById);
couponRouter.post("/coupons/add", createCoupon);
couponRouter.put("/coupons/edit/:id", updateCoupon);
couponRouter.delete("/coupons/:id", deleteCoupon);
couponRouter.patch("/coupons/:id/restore", restoreCoupon);
couponRouter.delete("/coupons/:id/force", forceDeleteCoupon);
couponRouter.patch("/coupons/toggle/:id", toggleCouponStatus);

export default couponRouter;
