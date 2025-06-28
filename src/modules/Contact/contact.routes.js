import express from "express";
import { contactController } from "./contact.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: Gửi tin nhắn liên hệ
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên người gửi
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email người gửi
 *               phone:
 *                 type: string
 *                 description: Số điện thoại người gửi
 *               subject:
 *                 type: string
 *                 description: Chủ đề tin nhắn
 *               message:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *     responses:
 *       200:
 *         description: Tin nhắn đã được gửi thành công
 *       400:
 *         description: Thiếu thông tin bắt buộc
 *       500:
 *         description: Lỗi server
 */
router.post("/", contactController.sendContactMessage);

export default router;