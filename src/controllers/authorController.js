import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Authors from "../model/Author.js";

export const getAuthors = async (req, res) => {
  const {
    offset = 0,
    limit = 5,
    name,
    sortBy = "created_at",
    order = "desc",
  } = req.query;
  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }
  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };
  try {
    const authors = await Authors.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));
    const total = await Authors.countDocuments(query);
    return successResponse(
      res,
      {
        data: authors,
        offset: parseInt(offset),
        limit: parseInt(limit),
        totalItems: total,
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
      "Lấy danh sách tác giả thành công"
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi lấy danh sách tác giả");
  }
};
