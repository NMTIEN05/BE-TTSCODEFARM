import Authors from "../model/Author.js";
import Book from "../model/Book.js";
import { authorValidate } from "../validate/authorValidate.js";

export const getAuthors = async (req, res) => {
  let {
    offset = "0",
    limit = "5",
    name,
    sortBy = "created_at",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
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
    const author = await Authors.findById(id);
    if (!author) {
      return res.error("Không tìm thấy tác giả", 404);
    }

    const books = await Book.find({ author_id: id }).populate("author_id");

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
    const deletedAuthor = await Authors.findOneAndDelete({ _id: id });
    if (!deletedAuthor) {
      return res.error("Không tìm thấy tác giả", 404);
    }

    let unknownAuthor = await Authors.findOne({ name: "Không xác định" });
    if (!unknownAuthor) {
      unknownAuthor = await new Authors({
        name: "Không xác định",
        nationality: "Không rõ",
        birth_date: new Date("1900-01-01"),
        bio: "Tác giả mặc định khi tác giả gốc bị xoá",
      }).save();
    }

    await Book.updateMany(
      { author_id: id },
      { $set: { author_id: unknownAuthor._id } }
    );

    return res.success(
      { author: unknownAuthor },
      "Xoá tác giả thành công và đã chuyển sách sang tác giả 'Không xác định'"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xoá tác giả thất bại");
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
      { _id: id },
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
