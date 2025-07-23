import express from "express";
import cors from "cors";
import connectDB from "./src/configs/db.js"; // Đảm bảo import đúng connectDB
import router from "./src/routes/index.js";
import uploadRouter from "./src/routes/upload.js";
import dotenv from "dotenv";
import setupSwagger from "./src/configs/swaggerConfig.js";
import responseHandler from "./src/middlewares/responseHandler.js";
import authRouter from "./src/modules/User/authRouter.js";
import { updateFlashSaleStatus } from "./src/utils/cronJobs.js";
// import cookieParser from "cookie-parser";

// Load biến môi trường
dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));
app.use(express.json());

// Serve static files
app.use('/uploads', express.static('uploads'));

// Kết nối MongoDB
connectDB();
// Middleware để xử lý phản hồi
app.use(responseHandler);

// API routes
app.use("/api", router);
app.use("/auth", authRouter);
app.use("/api/upload", uploadRouter);

setupSwagger(app);
// Khởi động cron jobs
updateFlashSaleStatus.start();

// Khởi động server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}/api`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
  console.log('Flash sale cron job started');
});
