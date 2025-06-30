import ReturnRequest from "./ReturnRequest.js";
import Order from "./Order.js";
import Book from "../Product/Book.js";
import ProductVariant from "../ProductVariant/ProductVariant.js";
import OrderDetail from "../OrderDetail/OrderDetail.js";
import UserModel from "../User/User.js";
import { sendOrderStatusEmail } from "../../utils/orderEmailNotification.js";
import { updateProductAvailability } from "../../utils/stockManager.js";
import handleAsync from "../../utils/handleAsync.js";

// Người dùng tạo yêu cầu hoàn trả
export const createReturnRequest = handleAsync(async (req, res) => {
  const { order_id, reason } = req.body;
  const user_id = req.user._id;

  // Kiểm tra đơn hàng tồn tại
  const order = await Order.findById(order_id);
  if (!order) {
    return res.error("Đơn hàng không tồn tại", 404);
  }

  // Kiểm tra đơn hàng thuộc về người dùng
  if (order.user_id.toString() !== user_id.toString()) {
    return res.error("Bạn không có quyền thực hiện hành động này", 403);
  }

  // Kiểm tra trạng thái đơn hàng
  if (order.status !== "delivered") {
    return res.error("Chỉ có thể yêu cầu hoàn trả đơn hàng đã giao", 400);
  }

  // Kiểm tra xem đã có yêu cầu hoàn trả cho đơn hàng này chưa
  const existingRequest = await ReturnRequest.findOne({ order_id });
  if (existingRequest) {
    return res.error("Đã tồn tại yêu cầu hoàn trả cho đơn hàng này", 400);
  }

  // Tạo yêu cầu hoàn trả
  const returnRequest = await ReturnRequest.create({
    order_id,
    user_id,
    reason
  });

  return res.success(
    { data: returnRequest },
    "Yêu cầu hoàn trả đã được gửi thành công"
  );
});

// Admin lấy danh sách yêu cầu hoàn trả
export const getReturnRequests = handleAsync(async (req, res) => {
  const { status, offset = 0, limit = 10 } = req.query;
  
  const query = {};
  if (status) {
    query.status = status;
  }
  
  const returnRequests = await ReturnRequest.find(query)
    .populate("order_id")
    .populate("user_id", "fullname email")
    .sort({ createdAt: -1 })
    .skip(parseInt(offset))
    .limit(parseInt(limit));
    
  const total = await ReturnRequest.countDocuments(query);
  
  return res.success(
    { 
      data: returnRequests,
      total,
      offset: parseInt(offset),
      limit: parseInt(limit)
    },
    "Lấy danh sách yêu cầu hoàn trả thành công"
  );
});

// Người dùng lấy danh sách yêu cầu hoàn trả của họ
export const getUserReturnRequests = handleAsync(async (req, res) => {
  const user_id = req.user._id;
  
  const returnRequests = await ReturnRequest.find({ user_id })
    .populate("order_id")
    .sort({ createdAt: -1 });
    
  return res.success(
    { data: returnRequests },
    "Lấy danh sách yêu cầu hoàn trả thành công"
  );
});

// Admin duyệt hoặc từ chối yêu cầu hoàn trả
export const processReturnRequest = handleAsync(async (req, res) => {
  const { id } = req.params;
  const { status, admin_note } = req.body;
  const admin_id = req.user._id;
  
  if (!["approved", "rejected"].includes(status)) {
    return res.error("Trạng thái không hợp lệ", 400);
  }
  
  const returnRequest = await ReturnRequest.findById(id);
  if (!returnRequest) {
    return res.error("Yêu cầu hoàn trả không tồn tại", 404);
  }
  
  if (returnRequest.status !== "pending") {
    return res.error("Yêu cầu hoàn trả này đã được xử lý", 400);
  }
  
  const session = await ReturnRequest.startSession();
  
  try {
    await session.startTransaction();
    
    // Cập nhật yêu cầu hoàn trả
    returnRequest.status = status;
    returnRequest.admin_note = admin_note;
    returnRequest.processed_by = admin_id;
    returnRequest.processed_at = new Date();
    await returnRequest.save({ session });
    
    // Nếu duyệt, cập nhật trạng thái đơn hàng và hoàn kho
    if (status === "approved") {
      const order = await Order.findById(returnRequest.order_id).session(session);
      if (!order) {
        throw new Error("Đơn hàng không tồn tại");
      }
      
      // Cập nhật trạng thái đơn hàng
      order.status = "returned";
      await order.save({ session });
      
      // Hoàn kho
      const details = await OrderDetail.find({ order_id: order._id }).session(session);
      
      for (const detail of details) {
        if (detail.variant_id) {
          const variant = await ProductVariant.findById(detail.variant_id).session(session);
          if (variant) {
            await ProductVariant.findByIdAndUpdate(
              detail.variant_id,
              { $inc: { stock_quantity: detail.quantity } },
              { session }
            );
            
            // Cập nhật trạng thái sản phẩm
            await updateProductAvailability(detail.book_id, detail.variant_id);
          }
        } else {
          const book = await Book.findById(detail.book_id).session(session);
          if (book) {
            await Book.findByIdAndUpdate(
              detail.book_id,
              { $inc: { stock_quantity: detail.quantity } },
              { session }
            );
            
            // Cập nhật trạng thái sản phẩm
            await updateProductAvailability(detail.book_id);
          }
        }
      }
      
      // Gửi email thông báo
      try {
        const user = await UserModel.findById(order.user_id);
        if (user && user.email) {
          await sendOrderStatusEmail(order, user, "returned");
        }
      } catch (emailError) {
        console.error("Lỗi khi gửi email thông báo:", emailError);
      }
    }
    
    await session.commitTransaction();
    
    return res.success(
      { data: returnRequest },
      status === "approved" 
        ? "Yêu cầu hoàn trả đã được duyệt và đơn hàng đã được hoàn trả" 
        : "Yêu cầu hoàn trả đã bị từ chối"
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Lỗi khi xử lý yêu cầu hoàn trả:", error);
    return res.error("Có lỗi xảy ra khi xử lý yêu cầu hoàn trả", 500);
  } finally {
    await session.endSession();
  }
});