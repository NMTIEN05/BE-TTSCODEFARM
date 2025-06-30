import Authors from "../Author/Author.js";
import Book from "../Product/Book.js";
import { authorValidate } from "./authorValidate.js";

export const getAuthors = async (req, res) => {
  let {
    offset = "0",
    limit = "5",
    name,
    sortBy = "createdAt",
    order = "desc",
    includeDeleted = false,
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
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
    const authors = await Authors.find(query)
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await Authors.countDocuments(query);

    return res.success(
      {
        data: authors,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách tác giả thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách tác giả");
  }
};

export const getAuthorById = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await Authors.findOne({ _id: id, deleted_at: null });
    if (!author) {
      return res.error("Không tìm thấy tác giả", 404);
    }

    const books = await Book.find({ author_id: id, deleted_at: null }).populate("author_id");

    return res.success(
      { data: { ...author.toObject(), books } },
      "Lấy tác giả thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy tác giả");
  }
};

export const deleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAuthor = await Authors.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!deletedAuthor) {
      return res.error("Không tìm thấy tác giả", 404);
    }

    return res.success(
      { data: deletedAuthor },
      "Xóa tác giả thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa tác giả thất bại");
  }
};

// Khôi phục tác giả
export const restoreAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredAuthor = await Authors.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null },
      { new: true }
    );

    if (!restoredAuthor) {
      return res.error("Không tìm thấy tác giả đã xóa", 404);
    }

    return res.success(
      { data: restoredAuthor },
      "Khôi phục tác giả thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi khôi phục tác giả", 500);
  }
};

// Xóa vĩnh viễn tác giả
export const forceDeleteAuthor = async (req, res) => {
  const { id } = req.params;
  try {
    const author = await Authors.findOneAndDelete({ _id: id, deleted_at: { $ne: null } });

    if (!author) {
      return res.error("Không tìm thấy tác giả đã xóa", 404);
    }

    return res.success(
      { data: author },
      "Xóa vĩnh viễn tác giả thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa vĩnh viễn tác giả thất bại");
  }
};

export const createAuthor = async (req, res) => {
  const { name } = req.body;

  try {
    const { error } = authorValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const checkName = await Authors.findOne({ name });
    if (checkName) {
      return res.error("Tác giả đã tồn tại", 400);
    }

    const newAuthor = await new Authors(req.body).save();
    return res.success({ data: newAuthor }, "Tạo tác giả thành công", 201);
  } catch (error) {
    console.error(error);
    return res.error("Tạo tác giả thất bại", 400);
  }
};

export const updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const { error } = authorValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const updatedAuthor = await Authors.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { $set: req.body },
      { new: true }
    );

    if (!updatedAuthor) {
      return res.error("Không tìm thấy tác giả", 404);
    }

    return res.success({ data: updatedAuthor }, "Cập nhật tác giả thành công");
  } catch (error) {
    console.error(error);
    return res.error("Cập nhật tác giả thất bại", 400);
  }
};
