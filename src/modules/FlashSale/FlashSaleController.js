import FlashSale from "./FlashSale.js";

export const getFlashSales = async (req, res) => {
  const { offset = 0, limit = 10 } = req.query;
  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  try {
    const flashSales = await FlashSale.find()
      .sort({ start_date: -1 })
      .skip(page * perPage)
      .limit(perPage);

    const total = await FlashSale.countDocuments();

    return res.success(
      {
        data: flashSales,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách flash sale thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách flash sale");
  }
};

export const getFlashSaleById = async (req, res) => {
  const { id } = req.params;
  try {
    const flashSale = await FlashSale.findById(id);
    if (!flashSale) {
      return res.error("Không tìm thấy flash sale", 404);
    }

    return res.success({ data: flashSale }, "Lấy flash sale thành công");
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy flash sale");
  }
};

export const createFlashSale = async (req, res) => {
  try {
    const created = await FlashSale.create(req.body);
    return res.success(
      { data: created },
      "Tạo flash sale thành công"
    );
  } catch (err) {
    console.error(err);
    return res.error("Lỗi khi tạo flash sale", 500);
  }
};

export const updateFlashSale = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await FlashSale.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.error("Không tìm thấy flash sale", 404);
    }
    return res.success({ data: updated }, "Cập nhật flash sale thành công");
  } catch (err) {
    console.error(err);
    return res.error("Cập nhật flash sale thất bại", 400);
  }
};

export const deleteFlashSale = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await FlashSale.findByIdAndDelete(id);
    if (!deleted) {
      return res.error("Không tìm thấy flash sale", 404);
    }
    return res.success({ data: deleted }, "Xoá flash sale thành công");
  } catch (err) {
    console.error(err);
    return res.error("Xoá flash sale thất bại", 500);
  }
};

export const activateFlashSale = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await FlashSale.findByIdAndUpdate(
      id,
      { is_active: true },
      { new: true }
    );
    return res.success({ data: updated }, "Kích hoạt flash sale thành công");
  } catch (err) {
    console.error(err);
    return res.error("Lỗi khi kích hoạt", 500);
  }
};

export const deactivateFlashSale = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await FlashSale.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );
    return res.success({ data: updated }, "Huỷ kích hoạt flash sale thành công");
  } catch (err) {
    console.error(err);
    return res.error("Lỗi khi huỷ kích hoạt", 500);
  }
};
