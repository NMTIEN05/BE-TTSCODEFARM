import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Book from "../model/Book.js";
import Author from "../model/Author.js";
import Category from "../model/Category.js";
import { BookValidate } from "../validate/bookValidate.js";

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
    // Xác thực dữ liệu
    const { error } = BookValidate.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        400
      );
    }
    // Kiểm tra author_id tồn tại
    const author = await Author.findById(author_id);
    if (!author) {
      return errorResponse(res, "Tác giả không tồn tại", 400);
    }
    // Kiểm tra category_id tồn tại
    const category = await Category.findById(category_id);
    if (!category) {
      return errorResponse(res, "Danh mục không tồn tại", 400);
    }
    // Kiểm tra sách đã tồn tại
    const existingBook = await Book.findOne({ title, author_id });
    if (existingBook) {
      return errorResponse(res, "Sách đã tồn tại", 400);
    }
    // Tạo và lưu sách
    const newBook = new Book({
      category_id,
      title,
      author_id,
      publisher,
      publish_year,
      description,
      price,
      stock_quantity: stock_quantity || 0,
      cover_image,
      is_available: is_available !== undefined ? is_available : true,
      created_at: new Date(),
      updated_at: new Date(),
    });
    await newBook.save();
    return successResponse(
      res,
      { data: newBook },
      "Tạo sách thành công",
      201
    );
  } catch (error) {
    console.error("Lỗi khi tạo sách:", error); // Ghi log lỗi chi tiết
    return errorResponse(res, `Lỗi server khi tạo sách: ${error.message}`, 500);
  }
};