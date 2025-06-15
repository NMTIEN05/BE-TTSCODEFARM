import Cart from "../model/Cart.js";
import CartItem from "../model/CartItem.js";
import Book from "../model/Book.js";
import UserModel from "../model/User.js";
import { cartItemValidate } from "./cartItemValidate.js";

// Thêm sách vào giỏ hàng
export const addToCart = async (req, res) => {
  const { user_id,book_id, quantity } = req.body;
//   const user_id = req.user.id; // Lấy từ middleware xác thực (JWT)

  try {
    // Validate đầu vào
    const { error } = cartItemValidate.validate({ book_id, quantity });
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    // Kiểm tra người dùng và sách
    const user = await UserModel.findById(user_id);
    const book = await Book.findById(book_id);
    if (!user || !book) {
      return res.error("Người dùng hoặc sách không tồn tại", 404);
    }

    // Kiểm tra số lượng tồn kho
    if (book.stock_quantity < quantity) {
      return res.error("Sách không đủ số lượng trong kho", 400);
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await Cart.findOne({ user_id, status: "active" });
    if (!cart) {
      cart = await Cart.create({
        user_id,
        status: "active",
        created_at: new Date(),
      });
    }

    // Kiểm tra xem sách đã có trong giỏ hàng chưa
    let cartItem = await CartItem.findOne({ cart_id: cart._id, book_id });
    if (cartItem) {
      // Cập nhật số lượng
      cartItem.quantity += quantity;
      cartItem.price = book.price;
      await cartItem.save();
    } else {
      // Thêm mới sản phẩm vào giỏ
      cartItem = await CartItem.create({
        cart_id: cart._id,
        book_id,
        quantity,
        price: book.price,
        added_at: new Date(),
      });
    }

    return res.success({ data: cartItem }, "Thêm vào giỏ hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi thêm vào giỏ hàng", 500);
  }
};