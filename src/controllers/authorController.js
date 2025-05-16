import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Authors from "../model/Author.js";
import Book from "../model/Book.js";

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

export const getAuthorById = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await Authors.findOne({ _id: id });
    if (!author) {
      return errorResponse(res, "Không tìm thấy tác giả", 404);
    }
    return successResponse(res, { data: author }, "Lấy tác giả thành công");
  } catch (error) {
    return errorResponse(res, "Lỗi server khi lấy tác giả");
  }
};

export const deleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    // Cập nhật Book
    await Book.updateMany({ author_id: id }, { $set: { author: "" } });
    // Xoá author
    const deletedAuthor = await Authors.findOneAndDelete({ _id: id });
    if (!deletedAuthor) {
      return errorResponse(res, "Không tìm thấy tác giả", 404);
    }
    // danh mục không xác định
    const unauthored = {
      _id: null,
      name: "Không xác định",
    };
    return successResponse(
      res,
      { author: unauthored },
      "Xoá tác giả thành công"
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi xoá tác giả");
  }
};
