import ProductVariant from "./ProductVariant.js";
import Book from "../Product/Book.js";

export const getVariantsByBookId = async (req, res) => {
  const { bookId } = req.params;
  
  try {
    const variants = await ProductVariant.find({ book_id: bookId });
    return res.success({ data: variants }, "Lấy danh sách biến thể thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách biến thể");
  }
};

export const createVariant = async (req, res) => {
  const { bookId } = req.params;
  const { format, price, stock_quantity, pages, weight, dimensions, file_size, file_format } = req.body;

  try {
    // Kiểm tra sách tồn tại
    const book = await Book.findById(bookId);
    if (!book) {
      return res.error("Sách không tồn tại", 404);
    }

    // Kiểm tra format đã tồn tại chưa
    const existingVariant = await ProductVariant.findOne({ book_id: bookId, format });
    if (existingVariant) {
      return res.error("Biến thể với format này đã tồn tại", 400);
    }

    const variantData = {
      book_id: bookId,
      format,
      price,
      stock_quantity,
      is_available: true
    };

    // Thêm thông tin riêng theo format
    if (format !== 'pdf') {
      variantData.pages = pages;
      variantData.weight = weight;
      variantData.dimensions = dimensions;
    } else {
      variantData.file_size = file_size;
      variantData.file_format = file_format;
    }

    const newVariant = await new ProductVariant(variantData).save();
    return res.success({ data: newVariant }, "Tạo biến thể thành công", 201);
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi tạo biến thể", 500);
  }
};

export const updateVariant = async (req, res) => {
  const { id } = req.params;
  
  try {
    const updatedVariant = await ProductVariant.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedVariant) {
      return res.error("Không tìm thấy biến thể", 404);
    }

    return res.success({ data: updatedVariant }, "Cập nhật biến thể thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi cập nhật biến thể", 500);
  }
};

export const deleteVariant = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVariant = await ProductVariant.findByIdAndDelete(id);
    if (!deletedVariant) {
      return res.error("Không tìm thấy biến thể", 404);
    }

    return res.success({ data: deletedVariant }, "Xóa biến thể thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi xóa biến thể", 500);
  }
};