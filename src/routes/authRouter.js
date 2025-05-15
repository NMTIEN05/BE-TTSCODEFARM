import express from "express";
import { login, register } from "../controllers/authController.js";

const authRouter = express.Router();

// Route đăng ký
authRouter.post("/register", register);
// Route đăng nhập
authRouter.post("/login", login);

export default authRouter;
