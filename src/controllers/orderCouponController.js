import OrderCoupon from "../model/OrderCoupon.js";

export const getOrderCoupons = async (req, res) => {
  let {
    offset = "0",
    limit = "10",
    order_id,
    coupon_id,
    sortBy = "_id",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (order_id) {
    query.order_id = order_id;
  }
  if (coupon_id) {
    query.coupon_id = coupon_id;
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const orderCoupons = await OrderCoupon.find(query)
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await OrderCoupon.countDocuments(query);

    return res.success(
      {
        data: orderCoupons,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách OrderCoupon thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy OrderCoupon");
  }
};

export const getOrderCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const oc = await OrderCoupon.findById(id)
      .populate("order_id")
      .populate("coupon_id");
    if (!oc) {
      return res.error("Không tìm thấy OrderCoupon", 404);
    }
    return res.success({ data: oc }, "Lấy OrderCoupon thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy OrderCoupon");
  }
};
