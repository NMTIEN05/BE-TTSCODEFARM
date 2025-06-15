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
