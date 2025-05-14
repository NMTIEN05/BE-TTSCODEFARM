import Category from "../../models/Category.js";

export const getCategoriesAll = async (req, res) => {
  const {
    page = 1,
    limit = 5,
    name,
    sortBy = "created_at",
    order = "desc",
  } = req.query;

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const categories = await Category.find(query)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    res.json({
      data: categories,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server khi lấy danh mục", error });
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOne({ _id: id });
    if (!category)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json(category);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi server khi lấy danh mục" });
  }
};

// Xóa danh mục bằng findOneAndDelete
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await Category.findOneAndDelete({ _id: id });
    if (!deleted)
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    res.json({ message: "Xoá danh mục thành công" });
  } catch (error) {
    res.status(500).json({ message: "Xoá thất bại", error });
  }
};