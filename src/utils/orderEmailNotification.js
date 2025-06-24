import { sendEmail } from "./sendMail.js";

const getStatusMessage = (status) => {
  const statusMessages = {
    pending: "Đang chờ xử lý",
    confirmed: "Đã xác nhận",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy"
  };
  return statusMessages[status] || status;
};

const getEmailContent = (order, user, status) => {
  const statusMessage = getStatusMessage(status);
  
  return {
    subject: `Cập nhật đơn hàng #${order._id.toString().slice(-6)}`,
    text: `Xin chào ${user.fullname},

Đơn hàng #${order._id.toString().slice(-6)} của bạn đã được cập nhật.

Trạng thái mới: ${statusMessage}
Tổng tiền: ${order.total_amount.toLocaleString('vi-VN')}đ
Địa chỉ giao hàng: ${order.shipping_address}

${status === 'shipped' ? 'Đơn hàng của bạn đang được giao. Vui lòng chú ý điện thoại.' : ''}
${status === 'delivered' ? 'Cảm ơn bạn đã mua hàng!' : ''}
${status === 'cancelled' ? 'Đơn hàng đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.' : ''}

Trân trọng,
Đội ngũ hỗ trợ`
  };
};

export const sendOrderStatusEmail = async (order, user, newStatus) => {
  try {
    const { subject, text } = getEmailContent(order, user, newStatus);
    await sendEmail(user.email, subject, text);
    console.log(`Email sent to ${user.email} for order ${order._id}`);
  } catch (error) {
    console.error('Error sending order status email:', error);
    throw error;
  }
};