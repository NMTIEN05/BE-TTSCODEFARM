import Book from "../model/Book.js";
import Order from "../model/Order.js";
import OrderDetail from "../model/OrderDetail.js";
import { orderValidate } from "../validate/orderValidate.js";

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
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await Order.countDocuments(query);

    return res.success(
      {
        data: orders,
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
    const order = await new Order(req.body).save();
    const { error } = orderValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }
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
