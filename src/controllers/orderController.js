import Order from "../model/Order.js";
import OrderDetail from "../model/OrderDetail.js";

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
