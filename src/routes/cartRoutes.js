import express from "express";
import { getCart } from "../controllers/cartController.js";
import { addToCart } from "../controllers/cartItemController.js";

const cartRouter = express.Router();
cartRouter.get("/cart/:user_id", getCart);
cartRouter.post("/cart-add", addToCart);

export default cartRouter;
