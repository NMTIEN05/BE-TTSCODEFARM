import OrderDetail from "../model/OrderDetail.js";

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
