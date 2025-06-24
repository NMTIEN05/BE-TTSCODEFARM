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
  checkProductStock,
  getLowStockAlert,
} from "./orderController.js";
import { validateStock } from "../../middlewares/stockValidation.js";

const orderRouter = express.Router();

orderRouter.get("/orders", getOrders);
orderRouter.get("/orders/:id", getOrderById);
orderRouter.post("/orders/add", validateStock, createOrder);
orderRouter.put("/orders/edit/:id", updateOrder);
orderRouter.delete("/orders/:id", deleteOrder);
orderRouter.patch("/orders/status/:id", updateOrderStatus);
orderRouter.patch("/orders/cancel/:id", cancelOrder);
orderRouter.get("/orders/user/:userId", getUserOrders);
orderRouter.get("/stock/check", checkProductStock);
orderRouter.get("/stock/low-stock", getLowStockAlert);

export default orderRouter;
