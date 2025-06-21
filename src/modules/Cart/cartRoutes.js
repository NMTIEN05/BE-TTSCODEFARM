import express from "express";
import { getCart } from "./cartController.js";
import { addToCart } from "../CartItem/cartItemController.js";

const cartRouter = express.Router();
cartRouter.get("/cart/:user_id", getCart);
cartRouter.post("/cart-add", addToCart);

export default cartRouter;
