import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Coupon from "../model/Coupon.js";

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
