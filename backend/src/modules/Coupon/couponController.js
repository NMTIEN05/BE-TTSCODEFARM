import Coupon from "./Coupon.js";
import { couponValidate } from "./couponValidate.js";
import mongoose from "mongoose";

export const getCoupons = async (req, res) => {
  let {
    offset = "0",
    limit = "10",
    code,
    sortBy = "createdAt",
    order = "desc",
    includeDeleted = false,
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (code) {
    query.code = { $regex: code, $options: "i" };
  }

  // Lọc theo trạng thái xóa
  if (includeDeleted === 'true') {
    query.deleted_at = { $ne: null };
  } else {
    query.deleted_at = { $eq: null };
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
    const coupon = await Coupon.findOne({ _id: id, deleted_at: null });
    if (!coupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }
    return res.success(
      { data: coupon },
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
    const deletedCoupon = await Coupon.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!deletedCoupon) {
      return res.error("Không tìm thấy mã giảm giá", 404);
    }

    return res.success(
      { data: deletedCoupon },
      "Xóa mã giảm giá thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa mã giảm giá thất bại");
  }
};

// Khôi phục mã giảm giá
export const restoreCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredCoupon = await Coupon.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null },
      { new: true }
    );

    if (!restoredCoupon) {
      return res.error("Không tìm thấy mã giảm giá đã xóa", 404);
    }

    return res.success(
      { data: restoredCoupon },
      "Khôi phục mã giảm giá thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi khôi phục mã giảm giá", 500);
  }
};

// Xóa vĩnh viễn mã giảm giá
export const forceDeleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await Coupon.findOneAndDelete({ _id: id, deleted_at: { $ne: null } });

    if (!coupon) {
      return res.error("Không tìm thấy mã giảm giá đã xóa", 404);
    }

    return res.success(
      { data: coupon },
      "Xóa vĩnh viễn mã giảm giá thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa vĩnh viễn mã giảm giá thất bại");
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
      { _id: id, deleted_at: null },
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

// Kiểm tra mã giảm giá
export const validateCoupon = async (req, res) => {
  try {
    const { code, totalAmount } = req.body;

    if (!code) {
      return res.error("Mã giảm giá không được để trống", 400);
    }

    // Tìm mã giảm giá
    const coupon = await Coupon.findOne({
      code: code,
      is_active: true,
      deleted_at: null,
      start_date: { $lte: new Date() },
      end_date: { $gte: new Date() }
    });

    if (!coupon) {
      return res.error("Mã giảm giá không hợp lệ hoặc đã hết hạn", 400);
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (totalAmount < coupon.min_purchase) {
      return res.error(`Giá trị đơn hàng tối thiểu phải từ ${coupon.min_purchase.toLocaleString()}đ`, 400);
    }

    // Tính toán số tiền giảm
    const discountAmount = Math.floor(totalAmount * (coupon.discount_percent / 100));

    return res.success({
      data: {
        couponId: coupon._id,
        code: coupon.code,
        discountPercent: coupon.discount_percent,
        discountAmount: discountAmount,
        finalAmount: totalAmount - discountAmount
      }
    }, "Áp dụng mã giảm giá thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi kiểm tra mã giảm giá", 500);
  }
};
