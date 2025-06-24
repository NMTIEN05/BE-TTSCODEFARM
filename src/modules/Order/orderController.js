import Book from "../Product/Book.js";
import Order from "./Order.js";
import OrderCoupon from "../OrderCoupon/OrderCoupon.js";
import OrderDetail from "../OrderDetail/OrderDetail.js";
import UserModel from "../User/User.js";
import { orderValidate } from "./orderValidate.js";
import { sendOrderStatusEmail } from "../../utils/orderEmailNotification.js";

export const getOrders = async (req, res) => {
  let {
    offset = "0",
    limit = "10",
    user_id,
    status,
    sortBy = "order_date",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (user_id) {
    query.user_id = user_id;
  }
  if (status) {
    query.status = status;
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const orders = await Order.find(query)
      .populate('user_id', 'fullname email')
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id })
          .populate('book_id', 'title cover_image');
        return {
          ...order.toObject(),
          details
        };
      })
    );

    const total = await Order.countDocuments(query);

    return res.success(
      {
        data: ordersWithDetails,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách đơn hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách đơn hàng");
  }
};
// Lấy đơn hàng theo id
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.error("Không tìm thấy đơn hàng", 404);
    }

    // Lấy chi tiết các sản phẩm trong đơn
    const details = await OrderDetail.find({ order_id: id })
      .populate("book_id")
      .populate("cart_item_id");

    // Lấy thông tin coupon đã áp cho đơn (nếu có)
    const coupons = await OrderCoupon.find({ order_id: id }).populate(
      "coupon_id"
    );

    return res.success(
      { data: { ...order.toObject(), details, coupons } },
      "Lấy đơn hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy đơn hàng");
  }
};
// Tạo đơn hàng
export const createOrder = async (req, res) => {
  const {
    user_id,
    cart_id,
    total_amount,
    shipping_address,
    payment_method,
    shipping_fee,
    tax,
    status,
    details,
    coupons,
  } = req.body;

  try {
    // Validate trước khi tạo
    const { error } = orderValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }
    
    const order = await new Order(req.body).save();
    for (const item of details) {
      const book = await Book.findById(item.book_id);
      if (!book || book.stock < item.quantity) {
        return res.error(`Sách không đủ hàng: ${item.book_id}`, 400);
      }

      book.stock -= item.quantity;
      await book.save();

      await OrderDetail.create({
        order_id: order._id,
        book_id: item.book_id,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      });
    }

    return res.success({ data: order }, "Tạo đơn hàng thành công");
  } catch (err) {
    console.error(err);
    return res.error("Lỗi khi tạo đơn hàng", 500);
  }
};
// Cập nhật đơn hàng
export const updateOrder = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate đầu vào
    const { error } = orderValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    // Cập nhật
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updated_at: new Date() } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.error("Không tìm thấy đơn hàng", 404);
    }

    return res.success({ data: updatedOrder }, "Cập nhật đơn hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Cập nhật đơn hàng thất bại", 400);
  }
};
// Xoá đơn hàng
export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOrder = await Order.findOneAndDelete({ _id: id });
    if (!deletedOrder) {
      return res.error("Không tìm thấy đơn hàng", 404);
    }
    // xoá các OrderDetail và OrderCoupon liên quan (cascade)
    await OrderDetail.deleteMany({ order_id: id });
    await OrderCoupon.deleteMany({ order_id: id });

    return res.success({ data: deletedOrder }, "Xoá đơn hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Xoá đơn hàng thất bại", 500);
  }
};
// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!validStatuses.includes(status))
    return res.error("Trạng thái không hợp lệ", 400);

  try {
    const order = await Order.findById(id);
    if (!order) return res.error("Không tìm thấy đơn hàng", 404);
    
    // Kiểm tra trạng thái không thể thay đổi
    if (["cancelled", "delivered"].includes(order.status)) {
      return res.error(
        "Không thể cập nhật đơn hàng đã hoàn tất hoặc bị huỷ",
        400
      );
    }

    // Kiểm tra luồng trạng thái tuần tự
    const statusFlow = {
      pending: ['confirmed'],
      confirmed: ['shipped'],
      shipped: ['delivered']
    };

    if (status !== 'cancelled' && order.status !== status) {
      const allowedNextStatuses = statusFlow[order.status] || [];
      if (!allowedNextStatuses.includes(status)) {
        return res.error(
          `Không thể chuyển từ trạng thái ${order.status} sang ${status}`,
          400
        );
      }
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Gửi email thông báo cho khách hàng
    try {
      console.log('Finding user for order:', order.user_id);
      const user = await UserModel.findById(order.user_id);
      console.log('User found:', user ? user.email : 'No user');
      
      if (user && user.email) {
        console.log('Sending email to:', user.email);
        await sendOrderStatusEmail(order, user, status);
        console.log('Email sent successfully');
      } else {
        console.log('No user or email found for order');
      }
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Không throw error để không ảnh hưởng đến việc cập nhật đơn hàng
    }

    return res.success(
      { data: order },
      "Cập nhật trạng thái đơn hàng thành công"
    );
  } catch (err) {
    console.error(err);
    return res.error("Lỗi server khi cập nhật trạng thái");
  }
};
// Huỷ đơn hàng và hoàn kho
export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order || order.status !== "pending")
      return res.error("Chỉ huỷ được đơn ở trạng thái pending", 400);

    order.status = "cancelled";
    await order.save();

    const details = await OrderDetail.find({ order_id: id });
    for (const d of details) {
      const book = await Book.findById(d.book_id);
      if (book) {
        book.stock += d.quantity;
        await book.save();
      }
    }

    // Gửi email thông báo hủy đơn
    try {
      const user = await UserModel.findById(order.user_id);
      if (user && user.email) {
        await sendOrderStatusEmail(order, user, "cancelled");
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }

    return res.success({ data: order }, "Đơn hàng đã huỷ và hoàn kho");
  } catch (err) {
    return res.error("Lỗi khi huỷ đơn", 500);
  }
};
// Lấy đơn hàng theo user
export const getUserOrders = async (req, res) => {
  const { userId } = req.params;
  const { limit = 10, offset = 0 } = req.query;
  
  if (!userId) {
    return res.error('UserId là bắt buộc', 400);
  }
  
  try {
    const orders = await Order.find({ user_id: userId })
      .populate('user_id', 'fullname email')
      .sort({ order_date: -1 })
      .skip(Number(offset))
      .limit(Number(limit));

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id })
          .populate('book_id', 'title cover_image');
        return {
          ...order.toObject(),
          details
        };
      })
    );

    return res.success(
      { data: ordersWithDetails },
      "Lấy danh sách đơn hàng người dùng thành công"
    );
  } catch (err) {
    console.error('getUserOrders error:', err);
    return res.error("Lỗi khi lấy đơn hàng người dùng", 500);
  }
};
