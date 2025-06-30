import CartItem from "../CartItem/CartItem.js";
import UserModel from "../User/User.js";
import Cart from "./Cart.js";
import Book from "../Product/Book.js";

// Lấy giỏ hàng của người dùng
export const getCart = async (req, res) => {
  const { user_id } = req.params;
  let { offset = "0", limit = "10" } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  try {
    // Kiểm tra người dùng tồn tại
    const user = await UserModel.findById(user_id);
    if (!user) {
      return res.error("Người dùng không tồn tại", 404);
    }

    // Tìm giỏ hàng đang hoạt động
    const cart = await Cart.findOne({ user_id, status: "active" });
    if (!cart) {
      return res.error("Giỏ hàng không tồn tại", 404);
    }

    // Lấy chi tiết các sản phẩm trong giỏ
    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate("book_id")
      .skip(page * perPage)
      .limit(perPage);

    const total = await CartItem.countDocuments({ cart_id: cart._id });

    return res.success(
      {
        data: { cart, items: cartItems },
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy giỏ hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi lấy giỏ hàng", 500);
  }
};
// Cập nhật số lượng sản phẩm trong giỏ
export const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  try {
    const item = await CartItem.findById(itemId);
    if (!item) return res.error("Không tìm thấy sản phẩm trong giỏ", 404);

    item.quantity = quantity;
    await item.save();

    return res.success(item, "Cập nhật số lượng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi cập nhật số lượng", 500);
  }
};
// Xoá sản phẩm khỏi giỏ
export const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const deleted = await CartItem.findByIdAndDelete(itemId);
    if (!deleted) return res.error("Không tìm thấy sản phẩm trong giỏ", 404);

    return res.success(deleted, "Xóa sản phẩm khỏi giỏ thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi xoá sản phẩm", 500);
  }
};

// Xóa toàn bộ giỏ hàng
export const clearCart = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cart = await Cart.findOne({ user_id, status: "active" });
    if (!cart) return res.error("Giỏ hàng không tồn tại", 404);

    await CartItem.deleteMany({ cart_id: cart._id });
    return res.success(null, "Xóa toàn bộ giỏ hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi xóa giỏ hàng", 500);
  }
};

// Tính tổng giá trị giỏ hàng
export const getCartTotal = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cart = await Cart.findOne({ user_id, status: "active" });
    if (!cart) return res.error("Giỏ hàng không tồn tại", 404);

    const cartItems = await CartItem.find({ cart_id: cart._id }).populate("book_id");
    
    const total = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return res.success({
      total_amount: total,
      item_count: itemCount,
      items: cartItems
    }, "Tính tổng giỏ hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi tính tổng giỏ hàng", 500);
  }
};

// Kiểm tra tồn kho trước khi thanh toán
export const validateCartStock = async (req, res) => {
  const { user_id } = req.params;

  try {
    const cart = await Cart.findOne({ user_id, status: "active" });
    if (!cart) return res.error("Giỏ hàng không tồn tại", 404);

    const cartItems = await CartItem.find({ cart_id: cart._id })
      .populate("book_id")
      .populate("variant_id");
    const outOfStock = [];

    for (const item of cartItems) {
      let availableStock = 0;
      let productName = item.book_id.title;
      
      if (item.variant_id) {
        availableStock = item.variant_id.stock_quantity;
        productName += ` (${item.variant_id.format})`;
        
        if (!item.variant_id.is_available) {
          outOfStock.push({
            book_id: item.book_id._id,
            variant_id: item.variant_id._id,
            product_name: productName,
            requested: item.quantity,
            available: 0,
            reason: "Biến thể không có sẵn"
          });
          continue;
        }
      } else {
        availableStock = item.book_id.stock_quantity;
      }

      if (availableStock < item.quantity) {
        outOfStock.push({
          book_id: item.book_id._id,
          variant_id: item.variant_id?._id || null,
          product_name: productName,
          requested: item.quantity,
          available: availableStock,
          reason: "Không đủ số lượng"
        });
      }
    }

    if (outOfStock.length > 0) {
      return res.error("Một số sản phẩm không đủ số lượng", 400, { outOfStock });
    }

    return res.success(null, "Tất cả sản phẩm đều có sẵn");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi kiểm tra tồn kho", 500);
  }
};
