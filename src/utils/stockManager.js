import Book from "../modules/Product/Book.js";
import ProductVariant from "../modules/ProductVariant/ProductVariant.js";

/**
 * Kiểm tra và cập nhật trạng thái sản phẩm khi hết hàng
 */
export const updateProductAvailability = async (bookId, variantId = null) => {
  try {
    if (variantId) {
      // Cập nhật trạng thái variant
      const variant = await ProductVariant.findById(variantId);
      if (variant && variant.stock_quantity === 0 && variant.is_available) {
        variant.is_available = false;
        await variant.save();
        console.log(`Variant ${variant.format} marked as unavailable (out of stock)`);
      } else if (variant && variant.stock_quantity > 0 && !variant.is_available) {
        variant.is_available = true;
        await variant.save();
        console.log(`Variant ${variant.format} marked as available (back in stock)`);
      }
    }

    // Kiểm tra và cập nhật trạng thái sách
    const book = await Book.findById(bookId);
    if (book) {
      // Kiểm tra tất cả variants của sách
      const variants = await ProductVariant.find({ book_id: bookId });
      const hasAvailableVariants = variants.some(v => v.stock_quantity > 0 && v.is_available);
      const hasBookStock = book.stock_quantity > 0;

      // Sách có sẵn nếu có stock riêng hoặc có variant có sẵn
      const shouldBeAvailable = hasBookStock || hasAvailableVariants;

      if (shouldBeAvailable && !book.is_available) {
        book.is_available = true;
        await book.save();
        console.log(`Book ${book.title} marked as available`);
      } else if (!shouldBeAvailable && book.is_available) {
        book.is_available = false;
        await book.save();
        console.log(`Book ${book.title} marked as unavailable (all variants out of stock)`);
      }
    }
  } catch (error) {
    console.error('Error updating product availability:', error);
  }
};

/**
 * Lấy thông tin tồn kho chi tiết của sản phẩm
 */
export const getStockInfo = async (bookId, variantId = null) => {
  try {
    const book = await Book.findById(bookId);
    if (!book) {
      return { error: "Sản phẩm không tồn tại" };
    }

    let stockInfo = {
      book_id: bookId,
      book_title: book.title,
      book_stock: book.stock_quantity,
      book_available: book.is_available,
      variants: []
    };

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant || variant.book_id.toString() !== bookId) {
        return { error: "Biến thể không tồn tại hoặc không thuộc sản phẩm này" };
      }
      
      stockInfo.selected_variant = {
        variant_id: variantId,
        format: variant.format,
        stock: variant.stock_quantity,
        available: variant.is_available,
        price: variant.price
      };
    } else {
      // Lấy tất cả variants
      const variants = await ProductVariant.find({ book_id: bookId });
      stockInfo.variants = variants.map(v => ({
        variant_id: v._id,
        format: v.format,
        stock: v.stock_quantity,
        available: v.is_available,
        price: v.price
      }));
    }

    return stockInfo;
  } catch (error) {
    console.error('Error getting stock info:', error);
    return { error: "Lỗi khi lấy thông tin tồn kho" };
  }
};

/**
 * Kiểm tra xem có thể đặt hàng với số lượng yêu cầu không
 */
export const canOrder = async (bookId, variantId, quantity) => {
  try {
    const book = await Book.findById(bookId);
    if (!book || !book.is_available) {
      return {
        canOrder: false,
        reason: "Sản phẩm không có sẵn",
        availableStock: 0
      };
    }

    let availableStock = 0;
    let productName = book.title;

    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant || !variant.is_available || variant.book_id.toString() !== bookId) {
        return {
          canOrder: false,
          reason: "Biến thể sản phẩm không có sẵn",
          availableStock: 0
        };
      }
      availableStock = variant.stock_quantity;
      productName += ` (${variant.format})`;
    } else {
      availableStock = book.stock_quantity;
    }

    if (availableStock < quantity) {
      return {
        canOrder: false,
        reason: `Không đủ số lượng. Còn lại: ${availableStock}`,
        availableStock,
        productName
      };
    }

    return {
      canOrder: true,
      availableStock,
      productName
    };
  } catch (error) {
    console.error('Error checking order availability:', error);
    return {
      canOrder: false,
      reason: "Lỗi khi kiểm tra tồn kho",
      availableStock: 0
    };
  }
};

/**
 * Thông báo sản phẩm sắp hết hàng (dưới 5 sản phẩm)
 */
export const getLowStockProducts = async (threshold = 5) => {
  try {
    const lowStockBooks = await Book.find({
      stock_quantity: { $lte: threshold, $gt: 0 },
      is_available: true
    }).select('title stock_quantity');

    const lowStockVariants = await ProductVariant.find({
      stock_quantity: { $lte: threshold, $gt: 0 },
      is_available: true
    }).populate('book_id', 'title').select('format stock_quantity book_id');

    return {
      books: lowStockBooks,
      variants: lowStockVariants.map(v => ({
        book_title: v.book_id.title,
        format: v.format,
        stock_quantity: v.stock_quantity,
        variant_id: v._id
      }))
    };
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return { books: [], variants: [] };
  }
};