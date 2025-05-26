import express from "express";
import {
  createOrderDetail,
  deleteOrderDetail,
  getOrderDetailById,
  getOrderDetails,
  updateOrderDetail,
} from "../controllers/orderDetailController.js";

const orderDetailRouter = express.Router();

orderDetailRouter.get("/order-details", getOrderDetails);
orderDetailRouter.get("/order-details/:id", getOrderDetailById);
orderDetailRouter.delete("/order-details/:id", deleteOrderDetail);
orderDetailRouter.post("/order-details/add", createOrderDetail);
orderDetailRouter.put("/order-details/edit/:id", updateOrderDetail);

export default orderDetailRouter;