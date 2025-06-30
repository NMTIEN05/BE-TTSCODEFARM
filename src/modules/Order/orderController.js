import Book from "../Product/Book.js";
import ProductVariant from "../ProductVariant/ProductVariant.js";
import Order from "./Order.js";
import OrderCoupon from "../OrderCoupon/OrderCoupon.js";
import OrderDetail from "../OrderDetail/OrderDetail.js";
import UserModel from "../User/User.js";
import Payment from "../Payment/Payment.js";
import { orderValidate } from "./orderValidate.js";
import { sendOrderStatusEmail } from "../../utils/orderEmailNotification.js";
import { updateProductAvailability, canOrder } from "../../utils/stockManager.js";

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
      .populate({
        path: 'user_id',
        select: 'fullname email',
        model: 'User'
      })
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id })
          .populate('book_id', 'title cover_image');
        
        const orderObj = order.toObject();
        // Nếu không có thông tin user, thêm fallback
        if (!orderObj.user_id || !orderObj.user_id.fullname) {
          orderObj.user_id = {
            fullname: 'Khách vãng lai',
            email: 'N/A'
          };
        }
        
        return {
          ...orderObj,
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

  const session = await Book.startSession();
  
  try {
    console.log('Received order data:', JSON.stringify(req.body, null, 2));
    
    // Validate trước khi tạo
    const { error } = orderValidate.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    // Bắt đầu transaction
    await session.startTransaction();
    
    // Kiểm tra tồn kho trước khi tạo đơn hàng
    const stockErrors = [];
    const stockUpdates = [];
    
    for (const item of details) {
      console.log('Checking stock for item:', item);
      
      if (item.variant_id && item.variant_id !== null) {
        const variant = await ProductVariant.findById(item.variant_id).session(session);
        console.log('Variant found:', variant ? `${variant.format} - Stock: ${variant.stock_quantity}` : 'Not found');
        
        if (!variant) {
          stockErrors.push(`Biến thể sản phẩm không tồn tại: ${item.variant_id}`);
          continue;
        }
        
        if (!variant.is_available) {
          stockErrors.push(`Biến thể ${variant.format} hiện không có sẵn`);
          continue;
        }
        
        if (variant.stock_quantity < item.quantity) {
          stockErrors.push(`Biến thể ${variant.format} không đủ hàng. Còn lại: ${variant.stock_quantity}, yêu cầu: ${item.quantity}`);
          continue;
        }
        
        if (variant.stock_quantity === 0) {
          stockErrors.push(`Biến thể ${variant.format} đã hết hàng`);
          continue;
        }
        
        stockUpdates.push({
          type: 'variant',
          id: variant._id,
          currentStock: variant.stock_quantity,
          quantity: item.quantity,
          name: `${variant.format}`
        });
      } else {
        const book = await Book.findById(item.book_id).session(session);
        console.log('Book found:', book ? `${book.title} - Stock: ${book.stock_quantity}` : 'Not found');
        
        if (!book) {
          stockErrors.push(`Sách không tồn tại: ${item.book_id}`);
          continue;
        }
        
        if (!book.is_available) {
          stockErrors.push(`Sách ${book.title} hiện không có sẵn`);
          continue;
        }
        
        if (book.stock_quantity < item.quantity) {
          stockErrors.push(`Sách ${book.title} không đủ hàng. Còn lại: ${book.stock_quantity}, yêu cầu: ${item.quantity}`);
          continue;
        }
        
        if (book.stock_quantity === 0) {
          stockErrors.push(`Sách ${book.title} đã hết hàng`);
          continue;
        }
        
        stockUpdates.push({
          type: 'book',
          id: book._id,
          currentStock: book.stock_quantity,
          quantity: item.quantity,
          name: book.title
        });
      }
    }
    
    // Nếu có lỗi tồn kho, rollback và trả về lỗi
    if (stockErrors.length > 0) {
      await session.abortTransaction();
      return res.error("Có sản phẩm không đủ hàng hoặc hết hàng", 400, { errors: stockErrors });
    }
    
    // Tạo đơn hàng
    const order = await new Order(req.body).save({ session });
    console.log('Order created:', order._id);
    
    // Cập nhật tồn kho và tạo chi tiết đơn hàng
    for (let i = 0; i < details.length; i++) {
      const item = details[i];
      const stockUpdate = stockUpdates[i];
      
      // Cập nhật tồn kho
      if (stockUpdate.type === 'variant') {
        await ProductVariant.findByIdAndUpdate(
          stockUpdate.id,
          { $inc: { stock_quantity: -stockUpdate.quantity } },
          { session }
        );
        console.log(`Variant ${stockUpdate.name} stock updated: ${stockUpdate.currentStock} -> ${stockUpdate.currentStock - stockUpdate.quantity}`);
        
        // Cập nhật trạng thái sản phẩm nếu hết hàng
        await updateProductAvailability(item.book_id, stockUpdate.id);
      } else {
        await Book.findByIdAndUpdate(
          stockUpdate.id,
          { $inc: { stock_quantity: -stockUpdate.quantity } },
          { session }
        );
        console.log(`Book ${stockUpdate.name} stock updated: ${stockUpdate.currentStock} -> ${stockUpdate.currentStock - stockUpdate.quantity}`);
        
        // Cập nhật trạng thái sản phẩm nếu hết hàng
        await updateProductAvailability(item.book_id);
      }
      
      // Tạo chi tiết đơn hàng
      await OrderDetail.create([{
        order_id: order._id,
        book_id: item.book_id,
        variant_id: item.variant_id || null,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
      }], { session });
    }
    
    // Commit transaction
    await session.commitTransaction();
    console.log('Transaction committed successfully');

    return res.success({ data: order }, "Tạo đơn hàng thành công");
  } catch (err) {
    // Rollback transaction nếu có lỗi
    await session.abortTransaction();
    console.error('Create order error:', err);
    console.error('Error stack:', err.stack);
    return res.error(err.message || "Lỗi khi tạo đơn hàng", 500);
  } finally {
    await session.endSession();
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
    "processing",
    "confirmed",
    "ready_to_ship",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  if (!validStatuses.includes(status))
    return res.error("Trạng thái không hợp lệ", 400);

  try {
    const order = await Order.findById(id);
    if (!order) return res.error("Không tìm thấy đơn hàng", 404);
    
    // Kiểm tra trạng thái không thể thay đổi
    if (["cancelled"].includes(order.status)) {
      return res.error(
        "Đơn hàng đã bị huỷ, không thể thay đổi trạng thái",
        400
      );
    }
    
    // Đơn hàng đã giao chỉ có thể chuyển sang trạng thái hoàn trả
    if (order.status === "delivered" && status !== "returned") {
      return res.error(
        "Đơn hàng đã giao chỉ có thể chuyển sang trạng thái hoàn trả",
        400
      );
    }
    
    // Đơn hàng đã hoàn trả không thể thay đổi trạng thái
    if (order.status === "returned") {
      return res.error(
        "Đơn hàng đã hoàn trả, không thể thay đổi trạng thái",
        400
      );
    }

    // Kiểm tra luồng trạng thái tuần tự
    const statusFlow = {
      pending: ['processing', 'confirmed', 'cancelled'],
      processing: ['confirmed', 'cancelled'],
      confirmed: ['ready_to_ship', 'cancelled'],
      ready_to_ship: ['shipped', 'cancelled'],
      shipped: ['delivered', 'returned'],
      delivered: ['returned']
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
      let user = null;
      
      if (order.user_id) {
        user = await UserModel.findById(order.user_id);
      } else {
        // Nếu không có user_id, thử tìm từ Payment record
        const payment = await Payment.findOne({ order_id: order._id });
        if (payment && payment.user_id) {
          user = await UserModel.findById(payment.user_id);
          console.log('Found user from payment record:', user?.email);
        }
      }
      
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
  const session = await Order.startSession();
  
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.error("Đơn hàng không tồn tại", 404);
    }
    
    if (!["pending", "processing", "confirmed", "ready_to_ship"].includes(order.status)) {
      return res.error("Chỉ huỷ được đơn ở trạng thái chờ xử lý, đang xử lý, đã xác nhận hoặc sẵn sàng giao hàng", 400);
    }

    await session.startTransaction();
    
    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";
    await order.save({ session });
    console.log(`Order ${id} status updated to cancelled`);

    // Lấy chi tiết đơn hàng và hoàn kho
    const details = await OrderDetail.find({ order_id: id }).session(session);
    const restoreLog = [];
    
    for (const detail of details) {
      if (detail.variant_id && detail.variant_id !== null) {
        const variant = await ProductVariant.findById(detail.variant_id).session(session);
        if (variant) {
          const oldStock = variant.stock_quantity;
          await ProductVariant.findByIdAndUpdate(
            detail.variant_id,
            { $inc: { stock_quantity: detail.quantity } },
            { session }
          );
          restoreLog.push(`Variant ${variant.format}: ${oldStock} -> ${oldStock + detail.quantity} (+${detail.quantity})`);
          console.log(`Restored variant stock: ${variant.format} +${detail.quantity}`);
          
          // Cập nhật trạng thái sản phẩm khi hoàn kho
          await updateProductAvailability(detail.book_id, detail.variant_id);
        }
      } else {
        const book = await Book.findById(detail.book_id).session(session);
        if (book) {
          const oldStock = book.stock_quantity;
          await Book.findByIdAndUpdate(
            detail.book_id,
            { $inc: { stock_quantity: detail.quantity } },
            { session }
          );
          restoreLog.push(`Book ${book.title}: ${oldStock} -> ${oldStock + detail.quantity} (+${detail.quantity})`);
          console.log(`Restored book stock: ${book.title} +${detail.quantity}`);
          
          // Cập nhật trạng thái sản phẩm khi hoàn kho
          await updateProductAvailability(detail.book_id);
        }
      }
    }
    
    await session.commitTransaction();
    console.log('Stock restoration completed:', restoreLog);

    // Gửi email thông báo hủy đơn (không dùng transaction)
    try {
      const user = await UserModel.findById(order.user_id);
      if (user && user.email) {
        await sendOrderStatusEmail(order, user, "cancelled");
        console.log('Cancellation email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }

    return res.success(
      { 
        data: order, 
        restored_items: restoreLog.length,
        message: "Hoàn kho thành công" 
      }, 
      "Đơn hàng đã huỷ và hoàn kho"
    );
  } catch (err) {
    await session.abortTransaction();
    console.error('Cancel order error:', err);
    return res.error("Lỗi khi huỷ đơn", 500);
  } finally {
    await session.endSession();
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

// Kiểm tra tồn kho sản phẩm
export const checkProductStock = async (req, res) => {
  const { bookId, variantId, quantity } = req.query;
  
  if (!bookId) {
    return res.error('bookId là bắt buộc', 400);
  }
  
  try {
    const stockCheck = await canOrder(bookId, variantId, parseInt(quantity) || 1);
    
    if (stockCheck.canOrder) {
      return res.success(
        {
          can_order: true,
          available_stock: stockCheck.availableStock,
          product_name: stockCheck.productName
        },
        "Sản phẩm có sẵn"
      );
    } else {
      return res.error(
        stockCheck.reason,
        400,
        {
          can_order: false,
          available_stock: stockCheck.availableStock,
          product_name: stockCheck.productName
        }
      );
    }
  } catch (err) {
    console.error('checkProductStock error:', err);
    return res.error("Lỗi khi kiểm tra tồn kho", 500);
  }
};

// Lấy danh sách sản phẩm sắp hết hàng
export const getLowStockAlert = async (req, res) => {
  const { threshold = 5 } = req.query;
  
  try {
    const { getLowStockProducts } = await import("../../utils/stockManager.js");
    const lowStockData = await getLowStockProducts(parseInt(threshold));
    
    return res.success(
      lowStockData,
      "Lấy danh sách sản phẩm sắp hết hàng thành công"
    );
  } catch (err) {
    console.error('getLowStockAlert error:', err);
    return res.error("Lỗi khi lấy danh sách sản phẩm sắp hết hàng", 500);
  }
};
// Xử lý đơn hàng hoàn trả
export const returnOrder = async (req, res) => {
  const { id } = req.params;
  const session = await Order.startSession();
  
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.error("Đơn hàng không tồn tại", 404);
    }
    
    if (order.status !== "delivered") {
      return res.error("Chỉ có thể hoàn trả đơn hàng đã giao", 400);
    }

    await session.startTransaction();
    
    // Cập nhật trạng thái đơn hàng
    order.status = "returned";
    await order.save({ session });
    console.log(`Order ${id} status updated to returned`);

    // Lấy chi tiết đơn hàng và hoàn kho
    const details = await OrderDetail.find({ order_id: id }).session(session);
    const restoreLog = [];
    
    for (const detail of details) {
      if (detail.variant_id && detail.variant_id !== null) {
        const variant = await ProductVariant.findById(detail.variant_id).session(session);
        if (variant) {
          const oldStock = variant.stock_quantity;
          await ProductVariant.findByIdAndUpdate(
            detail.variant_id,
            { $inc: { stock_quantity: detail.quantity } },
            { session }
          );
          restoreLog.push(`Variant ${variant.format}: ${oldStock} -> ${oldStock + detail.quantity} (+${detail.quantity})`);
          console.log(`Restored variant stock: ${variant.format} +${detail.quantity}`);
          
          // Cập nhật trạng thái sản phẩm khi hoàn kho
          await updateProductAvailability(detail.book_id, detail.variant_id);
        }
      } else {
        const book = await Book.findById(detail.book_id).session(session);
        if (book) {
          const oldStock = book.stock_quantity;
          await Book.findByIdAndUpdate(
            detail.book_id,
            { $inc: { stock_quantity: detail.quantity } },
            { session }
          );
          restoreLog.push(`Book ${book.title}: ${oldStock} -> ${oldStock + detail.quantity} (+${detail.quantity})`);
          console.log(`Restored book stock: ${book.title} +${detail.quantity}`);
          
          // Cập nhật trạng thái sản phẩm khi hoàn kho
          await updateProductAvailability(detail.book_id);
        }
      }
    }
    
    await session.commitTransaction();
    console.log('Stock restoration completed:', restoreLog);

    // Gửi email thông báo hoàn trả (không dùng transaction)
    try {
      const user = await UserModel.findById(order.user_id);
      if (user && user.email) {
        await sendOrderStatusEmail(order, user, "returned");
        console.log('Return notification email sent to:', user.email);
      }
    } catch (emailError) {
      console.error('Error sending return notification email:', emailError);
    }

    return res.success(
      { 
        data: order, 
        restored_items: restoreLog.length,
        message: "Hoàn kho thành công" 
      }, 
      "Đơn hàng đã hoàn trả và hoàn kho"
    );
  } catch (err) {
    await session.abortTransaction();
    console.error('Return order error:', err);
    return res.error("Lỗi khi hoàn trả đơn hàng", 500);
  } finally {
    await session.endSession();
  }
};