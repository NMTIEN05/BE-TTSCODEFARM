import { sendEmail } from "./sendMail.js";

const getStatusMessage = (status) => {
  const statusMessages = {
    pending: "Đang chờ xử lý",
    processing: "Đang xử lý",
    confirmed: "Đã xác nhận",
    ready_to_ship: "Sẵn sàng giao hàng",
    shipped: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    returned: "Đã hoàn trả"
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

${status === 'processing' ? 'Đơn hàng của bạn đang được xử lý.' : ''}
${status === 'confirmed' ? 'Đơn hàng của bạn đã được xác nhận và đang chuẩn bị hàng.' : ''}
${status === 'ready_to_ship' ? 'Đơn hàng của bạn đã sẵn sàng để giao.' : ''}
${status === 'shipped' ? 'Đơn hàng của bạn đang được giao. Vui lòng chú ý điện thoại.' : ''}
${status === 'delivered' ? 'Cảm ơn bạn đã mua hàng!' : ''}
${status === 'cancelled' ? 'Đơn hàng đã bị hủy. Nếu có thắc mắc, vui lòng liên hệ với chúng tôi.' : ''}
${status === 'returned' ? 'Đơn hàng của bạn đã được hoàn trả. Tiền sẽ được hoàn lại trong vòng 3-5 ngày làm việc.' : ''}

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