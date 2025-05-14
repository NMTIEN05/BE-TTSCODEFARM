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

// Tạo mới danh mục
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // Kiểm tra xem danh mục đã tồn tại chưa
    const checkName = await Category.findOne({ name });
    if (checkName) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    // Tạo mới danh mục
    const newCategory = await new Category({ name, description }).save();
    res
      .status(201)
      .json({ message: "Tạo danh mục thành công", data: newCategory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Tạo danh mục thất bại", error });
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          description,
          updated_at: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    res.json({
      message: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error) {
    res.status(400).json({ message: "Cập nhật thất bại", error });
  }
};

