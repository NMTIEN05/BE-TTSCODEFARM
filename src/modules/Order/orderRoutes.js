import express from "express";
import {
  cancelOrder,
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  getUserOrders,
  updateOrder,
  updateOrderStatus,
} from "./orderController.js";
import { testEmailSending } from "../../utils/testEmail.js";

const orderRouter = express.Router();

orderRouter.get("/orders", getOrders);
orderRouter.get("/orders/:id", getOrderById);
orderRouter.post("/orders/add", createOrder);
orderRouter.put("/orders/edit/:id", updateOrder);
orderRouter.delete("/orders/:id", deleteOrder);
orderRouter.patch("/orders/status/:id", updateOrderStatus);
orderRouter.patch("/orders/cancel/:id", cancelOrder);
orderRouter.get("/orders/user/:userId", getUserOrders);
orderRouter.get("/test-email", testEmailSending);

export default orderRouter;
