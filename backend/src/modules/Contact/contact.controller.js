import { sendEmail } from "../../utils/sendMail.js";
import handleAsync from "../../utils/handleAsync.js";

export const contactController = {
  sendContactMessage: handleAsync(async (req, res) => {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tên, email và nội dung tin nhắn",
      });
    }

    // Tạo nội dung email
    const emailSubject = `Liên hệ mới: ${subject || "Không có chủ đề"}`;
    const emailText = `
      Thông tin liên hệ mới:
      
      Họ tên: ${name}
      Email: ${email}
      Số điện thoại: ${phone || "Không cung cấp"}
      Chủ đề: ${subject || "Không có chủ đề"}
      
      Nội dung tin nhắn:
      ${message}
    `;

    // Gửi email
    await sendEmail(process.env.ADMIN_EMAIL || email, emailSubject, emailText);

    // Gửi email xác nhận cho người dùng
    const confirmationSubject = "Cảm ơn bạn đã liên hệ với chúng tôi";
    const confirmationText = `
      Xin chào ${name},
      
      Cảm ơn bạn đã liên hệ với chúng tôi. Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong thời gian sớm nhất.
      
      Nội dung tin nhắn của bạn:
      ${message}
      
      Trân trọng,
      Đội ngũ hỗ trợ
    `;

    await sendEmail(email, confirmationSubject, confirmationText);

    return res.status(200).json({
      success: true,
      message: "Tin nhắn của bạn đã được gửi thành công",
    });
  }),
};