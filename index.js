import express from "express";
import cors from "cors";
import connectDB from "./src/configs/db.js"; // Đảm bảo import đúng connectDB
import router from "./src/routes/index.js";
import dotenv from "dotenv";
import authRouter from "./src/routes/authRouter.js";
import setupSwagger from "./src/configs/swaggerConfig.js";
import responseHandler from "./src/middlewares/responseHandler.js";

// Load biến môi trường
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();
// Middleware để xử lý phản hồi
app.use(responseHandler);

// API routes
app.use("/api", router);
app.use("/auth", authRouter);

setupSwagger(app);
// Khởi động server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}/api`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
