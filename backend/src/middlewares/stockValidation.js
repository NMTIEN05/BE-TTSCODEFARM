import { canOrder } from "../utils/stockManager.js";

/**
 * Middleware kiểm tra tồn kho trước khi thêm vào giỏ hàng hoặc đặt hàng
 */
export const validateStock = async (req, res, next) => {
  try {
    const { book_id, variant_id, quantity, details } = req.body;
    
    // Nếu là đặt hàng với nhiều sản phẩm
    if (details && Array.isArray(details)) {
      const stockErrors = [];
      
      for (const item of details) {
        const stockCheck = await canOrder(item.book_id, item.variant_id, item.quantity);
        if (!stockCheck.canOrder) {
          stockErrors.push({
            book_id: item.book_id,
            variant_id: item.variant_id,
            error: stockCheck.reason,
            available: stockCheck.availableStock
          });
        }
      }
      
      if (stockErrors.length > 0) {
        return res.error("Một số sản phẩm không đủ hàng", 400, { stockErrors });
      }
    }
    // Nếu là thêm vào giỏ hàng với 1 sản phẩm
    else if (book_id && quantity) {
      const stockCheck = await canOrder(book_id, variant_id, quantity);
      if (!stockCheck.canOrder) {
        return res.error(stockCheck.reason, 400, {
          available_stock: stockCheck.availableStock,
          product_name: stockCheck.productName
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('Stock validation error:', error);
    return res.error("Lỗi khi kiểm tra tồn kho", 500);
  }
};

/**
 * Middleware cảnh báo sản phẩm sắp hết hàng
 */
export const lowStockWarning = async (req, res, next) => {
  try {
    const { book_id, variant_id, quantity } = req.body;
    
    if (book_id && quantity) {
      const stockCheck = await canOrder(book_id, variant_id, quantity);
      
      if (stockCheck.canOrder && stockCheck.availableStock <= 10) {
        // Thêm warning vào response headers
        res.set('X-Stock-Warning', `Sản phẩm sắp hết hàng. Còn lại: ${stockCheck.availableStock}`);
        res.set('X-Available-Stock', stockCheck.availableStock.toString());
      }
    }
    
    next();
  } catch (error) {
    console.error('Low stock warning error:', error);
    // Không block request nếu có lỗi warning
    next();
  }
};