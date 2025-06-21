import OrderDetail from "./OrderDetail.js";
import { orderDetailValidate } from "./orderDetailValidate.js";

export const getOrderDetails = async (req, res) => {
  let {
    offset = "0",
    limit = "10",
    order_id,
    book_id,
    sortBy = "_id",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (order_id) {
    query.order_id = order_id;
  }
  if (book_id) {
    query.book_id = book_id;
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const details = await OrderDetail.find(query)
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await OrderDetail.countDocuments(query);

    return res.success(
      {
        data: details,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách chi tiết đơn hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy chi tiết đơn hàng");
  }
};

export const getOrderDetailById = async (req, res) => {
  const { id } = req.params;
  try {
    const detail = await OrderDetail.findById(id)
      .populate("book_id")
      .populate("cart_item_id");
    if (!detail) {
      return res.error("Không tìm thấy chi tiết đơn hàng", 404);
    }
    return res.success({ data: detail }, "Lấy chi tiết đơn hàng thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy chi tiết đơn hàng");
  }
};

export const deleteOrderDetail = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedDetail = await OrderDetail.findOneAndDelete({ _id: id });
    if (!deletedDetail) {
      return res.error("Không tìm thấy chi tiết đơn hàng", 404);
    }
    return res.success(
      { data: deletedDetail },
      "Xoá chi tiết đơn hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xoá chi tiết đơn hàng thất bại", 500);
  }
};

export const createOrderDetail = async (req, res) => {
  try {
    // Validate
    const { error } = orderDetailValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const newDetail = await new OrderDetail(req.body).save();
    return res.success(
      { data: newDetail },
      "Tạo chi tiết đơn hàng thành công",
      201
    );
  } catch (error) {
    console.error(error);
    return res.error("Tạo chi tiết đơn hàng thất bại", 400);
  }
};

export const updateOrderDetail = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate
    const { error } = orderDetailValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const updatedDetail = await OrderDetail.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body, updated_at: new Date() } },
      { new: true }
    );

    if (!updatedDetail) {
      return res.error("Không tìm thấy chi tiết đơn hàng", 404);
    }

    return res.success(
      { data: updatedDetail },
      "Cập nhật chi tiết đơn hàng thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Cập nhật chi tiết đơn hàng thất bại", 400);
  }
};
