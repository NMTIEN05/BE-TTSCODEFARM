import Coupon from "../model/Coupon.js";
import Order from "../model/Order.js";
import OrderCoupon from "../model/OrderCoupon.js";
import { orderCouponValidate } from "../validate/orderCouponValidate.js";

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

export const createOrderCoupon = async (req, res) => {
  try {
    // Validate
    const { error } = orderCouponValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const newOC = await new OrderCoupon(req.body).save();
    return res.success({ data: newOC }, "Tạo OrderCoupon thành công", 201);
  } catch (error) {
    console.error(error);
    return res.error("Tạo OrderCoupon thất bại", 400);
  }
};

export const updateOrderCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate
    const { error } = orderCouponValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const updatedOC = await OrderCoupon.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updated_at: new Date() } },
      { new: true }
    );

    if (!updatedOC) {
      return res.error("Không tìm thấy OrderCoupon", 404);
    }

    return res.success({ data: updatedOC }, "Cập nhật OrderCoupon thành công");
  } catch (error) {
    console.error(error);
    return res.error("Cập nhật OrderCoupon thất bại", 400);
  }
};

export const deleteOrderCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedOC = await OrderCoupon.findOneAndDelete({ _id: id });
    if (!deletedOC) {
      return res.error("Không tìm thấy OrderCoupon", 404);
    }
    return res.success({ data: deletedOC }, "Xoá OrderCoupon thành công");
  } catch (error) {
    console.error(error);
    return res.error("Xoá OrderCoupon thất bại", 500);
  }
};
// Kiểm tra
export const validateAndApplyCoupon = async (req, res) => {
  const { order_id, coupon_code } = req.body;

  try {
    const order = await Order.findById(order_id);
    if (!order) return res.error("Không tìm thấy đơn hàng", 404);

    const coupon = await Coupon.findOne({ code: coupon_code });
    if (!coupon) return res.error("Không tìm thấy mã giảm giá", 404);

    const now = new Date();
    if (now < coupon.start_date || now > coupon.end_date) {
      return res.error("Mã giảm giá không còn hiệu lực", 400);
    }

    const exists = await OrderCoupon.findOne({
      order_id,
      coupon_id: coupon._id,
    });
    if (exists) return res.error("Đơn hàng đã áp dụng mã này", 400);

    await OrderCoupon.create({
      order_id,
      coupon_id: coupon._id,
      discount_amount: coupon.discount_amount,
    });

    return res.success({}, "Mã giảm giá được áp dụng thành công");
  } catch (err) {
    return res.error("Lỗi khi áp mã", 500);
  }
};
