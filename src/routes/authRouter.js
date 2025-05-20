import express from "express";
import { deleteUser, login, register, updateUser } from "../controllers/authController.js";

const authRouter = express.Router();

// Route đăng ký
authRouter.post("/register", register);
authRouter.put("/auth/:id", updateUser);
authRouter.delete("/auth/:id", deleteUser);


// Route đăng nhập
authRouter.post("/login", login);

export default authRouter;
