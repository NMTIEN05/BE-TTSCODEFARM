import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  toggleCouponStatus,
  updateCoupon,
  restoreCoupon,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.get("/coupons", getCoupons);
couponRouter.get("/coupons/:id", getCouponById);
couponRouter.post("/coupons/add", createCoupon);
couponRouter.put("/coupons/edit/:id", updateCoupon);
couponRouter.delete("/coupons/:id", deleteCoupon);
couponRouter.patch("/coupons/restore/:id", restoreCoupon);
couponRouter.patch("/coupons/toggle/:id", toggleCouponStatus);

export default couponRouter;
