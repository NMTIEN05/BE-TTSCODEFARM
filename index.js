import express from "express";
import cors from "cors";
import connectDB from "./src/configs/db.js"; // Đảm bảo import đúng connectDB
import router from "./src/routes/index.js";
import dotenv from "dotenv";
import authRouter from "./src/routes/authRouter.js";

// Load biến môi trường
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
connectDB();
// API routes
app.use("/api", router);
app.use("/auth", authRouter); 


// Khởi động server
const PORT = process.env.PORT || 8888;
app.listen(PORT, () => {
  console.log(`Server is running on: http://localhost:${PORT}/api`);
});
