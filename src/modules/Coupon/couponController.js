import Coupon from "../model/Coupon.js";
import { couponValidate } from "../../validate/couponValidate.js";

export const getCoupons = async (req, res) => {
  let {
    offset = "0",
    limit = "10",
    code,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (code) {
    query.code = { $regex: code, $options: "i" };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const coupons = await Coupon.find(query)
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await Coupon.countDocuments(query);

    return res.success(
      {
        data: coupons,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách mã giảm giá thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách mã giảm giá");
  }
};

export const getCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }
    const orderCoupon = await OrderCoupon.find({ coupon_id: id }).populate(
      "coupon_id"
    );
    return res.success(
      { data: { ...coupon.toObject(), orderCoupon } },
      "Lấy mã giảm giá thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy mã giảm giá");
  }
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCoupon = await Coupon.findOneAndDelete({ _id: id });
    if (!deletedCoupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }

    return res.success({ data: deletedCoupon }, "Xoá mã giảm giá thành công");
  } catch (error) {
    console.error(error);
    return res.error("Xoá mã giảm giá thất bại");
  }
};

export const createCoupon = async (req, res) => {
  try {
    const { error } = couponValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const { code } = req.body;
    const checkCode = await Coupon.findOne({ code });
    if (checkCode) {
      return res.error("Mã giảm giá đã tồn tại", 400);
    }

    const newCoupon = await new Coupon(req.body).save();
    return res.success({ data: newCoupon }, "Tạo mã giảm giá thành công", 201);
  } catch (error) {
    console.error(error);
    return res.error("Tạo mã giảm giá thất bại", 400);
  }
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = couponValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const updatedCoupon = await Coupon.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...req.body,
          updated_at: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedCoupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }

    return res.success(
      { data: updatedCoupon },
      "Cập nhật mã giảm giá thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Cập nhật mã giảm giá thất bại", 400);
  }
};
// Kích hoạt hoặc vô hiệu hóa mã giảm giá
export const toggleCouponStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const updateData = { is_active };

    // Nếu đang kích hoạt thì lưu thời gian kích hoạt
    if (is_active) {
      updateData.activatedAt = new Date();
    } else {
      updateData.activatedAt = null;
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedCoupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }

    return res.success(
      { data: updatedCoupon },
      `Cập nhật trạng thái mã giảm giá thành công, trạng thái hiện tại: ${
        is_active ? "Kích hoạt" : "Vô hiệu hóa"
      }`
    );
  } catch (error) {
    return res.error("Lỗi server khi cập nhật trạng thái mã giảm giá", 500);
  }
};
