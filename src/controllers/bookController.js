import Book from "../model/Book.js";
import Author from "../model/Author.js";
import Category from "../model/Category.js";
import { BookValidate } from "../validate/bookValidate.js";

// ✅ Hàm xử lý lỗi chuẩn
const errorResponse = (res, message, status = 500) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

export const createBook = async (req, res) => {
  const {
    category_id,
    title,
    author_id,
    publisher,
    publish_year,
    description,
    price,
    stock_quantity,
    cover_image,
    is_available,
  } = req.body;
  try {
    const { error } = BookValidate.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        400
      );
    }

    const author = await Author.findById(author_id);
    if (!author) {
      return errorResponse(res, "Tác giả không tồn tại", 400);
    }

    const category = await Category.findById(category_id);
    if (!category) {
      return errorResponse(res, "Danh mục không tồn tại", 400);
    }

    const existingBook = await Book.findOne({ title, author_id });
    if (existingBook) {
      return errorResponse(res, "Sách đã tồn tại", 400);
    }

    const newBook = new Book({
      category_id,
      title,
      author_id,
      publisher,
      publish_year: publish_year ? new Date(publish_year) : undefined,
      description,
      price,
      stock_quantity: Number(stock_quantity) || 0,
      cover_image,
      is_available: is_available !== undefined ? is_available : true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await newBook.save();
    return res.success({ data: newBook }, "Tạo sách thành công", 201);
  } catch (error) {
    console.error("Lỗi khi tạo sách:", error);
    return errorResponse(res, `Lỗi server khi tạo sách: ${error.message}`, 500);
  }
};

export const getBooks = async (req, res) => {
  const {
    offset = 0,
    limit = 5,
    title,
    category_id,
    author_id,
    sortBy = "created_at",
    order = "desc",
    includeDeleted = "false"
  } = req.query;

  const query = includeDeleted === "true" ? { is_deleted: true } : { $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }] };
  if (title) query.title = { $regex: title, $options: "i" };
  if (category_id) query.category_id = category_id;
  if (author_id) query.author_id = author_id;

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const books = await Book.find(query)
      .populate("category_id", "name")
      .populate("author_id", "name")
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Book.countDocuments(query);

    return res.success(
      {
        data: books,
        offset: parseInt(offset),
        limit: parseInt(limit),
        totalItems: total,
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
      "Lấy danh sách sách thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi lấy danh sách sách");
  }
};

export const getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findOne({ _id: id })
      .populate("category_id", "name")
      .populate("author_id", "name");

    if (!book) {
      return res.error("Không tìm thấy sách", 404);
    }

    return res.success({ data: book }, "Lấy thông tin sách thành công");
  } catch (error) {
    return res.error("Lỗi server khi lấy thông tin sách", 500);
  }
};

export const updateBook = async (req, res) => {
  const { id } = req.params;
  const {
    category_id,
    title,
    author_id,
    publisher,
    publish_year,
    description,
    price,
    stock_quantity,
    cover_image,
    is_available,
  } = req.body;

  try {
    const { error } = BookValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const category = await Category.findById(category_id);
    if (!category) {
      return res.error("Danh mục không tồn tại", 404);
    }

    const author = await Author.findById(author_id);
    if (!author) {
      return res.error("Tác giả không tồn tại", 404);
    }

    const updatedBook = await Book.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          category_id,
          title,
          author_id,
          publisher,
          publish_year: publish_year ? new Date(publish_year) : undefined,
          description,
          price,
          stock_quantity: Number(stock_quantity),
          cover_image,
          is_available,
          updated_at: new Date(),
        },
      },
      { new: true }
    )
      .populate("category_id", "name")
      .populate("author_id", "name");

    if (!updatedBook) {
      return res.error("Không tìm thấy sách", 404);
    }

    return res.success({ data: updatedBook }, "Cập nhật sách thành công");
  } catch (error) {
    return res.error("Lỗi server khi cập nhật sách", 500);
  }
};

export const deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);
    if (!book) {
      return errorResponse(res, "Không tìm thấy sách", 404);
    }

    // Xóa mềm
    const deletedBook = await Book.findByIdAndUpdate(
      id,
      { 
        is_deleted: true, 
        deleted_at: new Date() 
      },
      { new: true }
    );

    return res.success({ data: deletedBook }, "Xóa mềm sách thành công");
  } catch (error) {
    return res.error("Lỗi server khi xóa sách", 500);
  }
};

export const restoreBook = async (req, res) => {
  const { id } = req.params;
  try {
    const book = await Book.findById(id);
    if (!book) {
      return errorResponse(res, "Không tìm thấy sách", 404);
    }

    const restoredBook = await Book.findByIdAndUpdate(
      id,
      { 
        is_deleted: false, 
        deleted_at: null 
      },
      { new: true }
    );

    return res.success({ data: restoredBook }, "Khôi phục sách thành công");
  } catch (error) {
    return res.error("Khôi phục sách thất bại");
  }
};
