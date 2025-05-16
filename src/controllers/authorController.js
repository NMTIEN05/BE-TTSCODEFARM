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

export const createAuthor = async (req, res) => {
  const { name, bio, birth_date, nationality } = req.body;
  try {
    // Validate
    const { error } = AuthorValidate.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        400
      );
    }
    const existingAuthor = await Authors.findOne({ name });
    if (existingAuthor) {
      return errorResponse(res, "Tác giả đã tồn tại", 400);
    }
    const newAuthor = new Authors({
      name,
      bio,
      birth_date,
      nationality,
    });
    await newAuthor.save();
    return successResponse(
      res,
      { data: newAuthor },
      "Tạo tác giả thành công",
      201
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi tạo tác giả");
  }
};

export const updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { name, bio, birth_date, nationality } = req.body;
  try {
    // Validate
    const { error } = AuthorValidate.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        400
      );
    }
    const updatedAuthor = await Authors.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          bio,
          birth_date,
          nationality,
        },
      },
      { new: true }
    );
    if (!updatedAuthor) {
      return errorResponse(res, "Không tìm thấy tác giả", 404);
    }
    return successResponse(
      res,
      { data: updatedAuthor },
      "Cập nhật tác giả thành công"
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi cập nhật tác giả");
  }
};
