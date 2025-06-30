import express from "express";
import { 
  createReturnRequest, 
  getReturnRequests, 
  getUserReturnRequests, 
  processReturnRequest 
} from "./returnRequestController.js";
import { protect, isAdmin } from "../../middlewares/auth.js";

const router = express.Router();

// Người dùng tạo yêu cầu hoàn trả
router.post("/return-requests", protect, createReturnRequest);

// Người dùng lấy danh sách yêu cầu hoàn trả của họ
router.get("/return-requests/my-requests", protect, getUserReturnRequests);

// Admin lấy danh sách tất cả yêu cầu hoàn trả
router.get("/return-requests", protect, isAdmin, getReturnRequests);

// Admin duyệt hoặc từ chối yêu cầu hoàn trả
router.patch("/return-requests/:id", protect, isAdmin, processReturnRequest);

export default router;