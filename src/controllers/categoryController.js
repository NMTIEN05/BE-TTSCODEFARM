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
