import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import UserModel from "../model/User.js";


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
