import Cart from "../Cart/Cart.js";
import CartItem from "./CartItem.js";
import Book from "../Product/Book.js";
import ProductVariant from "../ProductVariant/ProductVariant.js";
import UserModel from "../User/User.js";
import { cartItemValidate } from "./cartItemValidate.js";

// Thêm sách vào giỏ hàng
export const addToCart = async (req, res) => {
  const { user_id, book_id, variant_id, quantity } = req.body;

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

    let availableStock = 0;
    let price = book.price;
    let variant = null;

    // Kiểm tra biến thể nếu có
    if (variant_id) {
      variant = await ProductVariant.findById(variant_id);
      if (!variant || variant.book_id.toString() !== book_id) {
        return res.error("Biến thể sản phẩm không tồn tại hoặc không thuộc sách này", 404);
      }
      if (!variant.is_available) {
        return res.error("Biến thể sản phẩm hiện không có sẵn", 400);
      }
      availableStock = variant.stock_quantity;
      price = variant.price;
    } else {
      availableStock = book.stock_quantity;
    }

    // Kiểm tra số lượng tồn kho
    if (availableStock < quantity) {
      return res.error(
        `Sản phẩm không đủ số lượng trong kho. Còn lại: ${availableStock}`,
        400,
        { availableStock }
      );
    }

    if (availableStock === 0) {
      return res.error("Sản phẩm đã hết hàng", 400);
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

    // Kiểm tra xem sản phẩm (với biến thể) đã có trong giỏ hàng chưa
    const query = { cart_id: cart._id, book_id };
    if (variant_id) {
      query.variant_id = variant_id;
    } else {
      query.variant_id = { $exists: false };
    }

    let cartItem = await CartItem.findOne(query);
    if (cartItem) {
      // Kiểm tra tổng số lượng sau khi cộng
      const newQuantity = cartItem.quantity + quantity;
      if (newQuantity > availableStock) {
        return res.error(
          `Tổng số lượng vượt quá tồn kho. Còn lại: ${availableStock}, trong giỏ: ${cartItem.quantity}`,
          400,
          { availableStock, currentInCart: cartItem.quantity }
        );
      }
      cartItem.quantity = newQuantity;
      cartItem.price = price;
      await cartItem.save();
    } else {
      // Thêm mới sản phẩm vào giỏ
      cartItem = await CartItem.create({
        cart_id: cart._id,
        book_id,
        variant_id: variant_id || null,
        quantity,
        price,
        added_at: new Date(),
      });
    }

    // Populate thông tin để trả về
    await cartItem.populate('book_id');
    if (variant_id) {
      await cartItem.populate('variant_id');
    }

    return res.success({ data: cartItem }, "Thêm vào giỏ hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi khi thêm vào giỏ hàng", 500);
  }
};