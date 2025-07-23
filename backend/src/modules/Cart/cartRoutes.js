import express from "express";
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart, 
  getCartTotal, 
  validateCartStock 
} from "./cartController.js";
import { addToCart } from "../CartItem/cartItemController.js";
import { validateStock, lowStockWarning } from "../../middlewares/stockValidation.js";

const cartRouter = express.Router();

// Lấy giỏ hàng
cartRouter.get("/cart/:user_id", getCart);

// Thêm sản phẩm vào giỏ
cartRouter.post("/cart-add", validateStock, lowStockWarning, addToCart);

// Cập nhật số lượng sản phẩm
cartRouter.put("/cart-item/:itemId", updateCartItem);

// Xóa sản phẩm khỏi giỏ
cartRouter.delete("/cart-item/:itemId", removeCartItem);

// Xóa toàn bộ giỏ hàng
cartRouter.delete("/cart/:user_id/clear", clearCart);

// Tính tổng giá trị giỏ hàng
cartRouter.get("/cart/:user_id/total", getCartTotal);

// Kiểm tra tồn kho
cartRouter.get("/cart/:user_id/validate", validateCartStock);

export default cartRouter;