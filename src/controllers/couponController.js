import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Coupon from "../model/Coupon.js";
import { ValidateCoupon } from "../validate/couponValidate.js";

export const getCoupons = async (req, res) => {
  const {
    offset = 0,
    limit = 10,
    code,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  const query = {};
  if (code) {
    query.code = { $regex: code, $options: "i" };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const coupons = await Coupon.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Coupon.countDocuments(query);

    return successResponse(
      res,
      {
        data: coupons,
        offset: parseInt(offset),
        limit: parseInt(limit),
        totalItems: total,
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
      "Lấy danh sách mã giảm giá thành công"
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi lấy danh sách mã giảm giá");
  }
};

// Tạo mã giảm giá mới
export const createCoupon = async (req, res) => {
  try {
    // Validate dữ liệu đầu vào
    const { error } = ValidateCoupon.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return errorResponse(res, errors.join(", "), 400);
    }

    const { code } = req.body;

    const exists = await Coupon.findOne({ code });
    if (exists) {
      return errorResponse(res, "Mã giảm giá đã tồn tại", 400);
    }

    const newCoupon = await new Coupon(req.body).save();

    return successResponse(
      res,
      { data: newCoupon },
      "Tạo mã giảm giá thành công",
      201
    );
  } catch (error) {
    console.log(error);

    return errorResponse(res, "Tạo mã giảm giá thất bại", 400);
  }
};

// Cập nhật mã giảm giá
export const updateCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    // Validate dữ liệu update
    const { error } = ValidateCoupon.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return errorResponse(res, errors.join(", "), 400);
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCoupon) {
      return errorResponse(res, "Không tìm thấy mã giảm giá", 404);
    }

    return successResponse(
      res,
      { data: updatedCoupon },
      "Cập nhật mã giảm giá thành công"
    );
  } catch (error) {
    console.log(error);

    return errorResponse(res, "Cập nhật mã giảm giá thất bại", 400);
  }
};

// Lấy mã giảm giá theo ID
export const getCouponById = async (req, res) => {
  const { id } = req.params;
  try {
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return errorResponse(res, "Không tìm thấy mã giảm giá", 404);
    }
    return successResponse(res, { data: coupon }, "Lấy mã giảm giá thành công");
  } catch (error) {
    return errorResponse(res, "Lỗi server khi lấy mã giảm giá");
  }
};

// Xoá mã giảm giá
export const deleteCoupon = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Coupon.findByIdAndDelete(id);
    if (!deleted) {
      return errorResponse(res, "Không tìm thấy mã giảm giá", 404);
    }

    return successResponse(
      res,
      { data: deleted },
      "Xoá mã giảm giá thành công"
    );
  } catch (error) {
    return errorResponse(res, "Xoá mã giảm giá thất bại");
  }
};
