import Book from "../model/Book.js";
import Category from "../model/Category.js";
import { categoryValidate } from "../validate/categoryValidate.js";

export const getCategorys = async (req, res) => {
  let {
    offset = "0",
    limit = "5",
    name,
    sortBy = "created_at",
    order = "desc",
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  const sortOrder = order === "asc" ? 1 : -1;
  const sortOptions = { [sortBy]: sortOrder };

  try {
    const categories = await Category.find(query)
      .sort(sortOptions)
      .skip(page * perPage)
      .limit(perPage);

    const total = await Category.countDocuments(query);

    return res.success(
      {
        data: categories,
        offset: page,
        limit: perPage,
        totalItems: total,
        hasMore: (page + 1) * perPage < total,
      },
      "Lấy danh sách danh mục thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh sách danh mục");
  }
};

export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.error("Không tìm thấy danh mục", 404);
    }

    const books = await Book.find({ category_id: id }).populate("category_id");

    return res.success(
      { data: { ...category.toObject(), books } },
      "Lấy danh mục thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Lỗi server khi lấy danh mục");
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCategory = await Category.findOneAndDelete({ _id: id });
    if (!deletedCategory) {
      return res.error("Không tìm thấy danh mục", 404);
    }

    let uncategorized = await Category.findOne({ name: "Không xác định" });
    if (!uncategorized) {
      uncategorized = await new Category({
        name: "Không xác định",
        description: "Danh mục mặc định khi danh mục gốc bị xoá",
      }).save();
    }

    await Book.updateMany(
      { category_id: id },
      { $set: { category_id: uncategorized._id } }
    );

    return res.success(
      { category: uncategorized },
      "Xoá danh mục thành công và đã chuyển sách sang danh mục 'Không xác định'"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xoá danh mục thất bại");
  }
};

export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    const { error } = categoryValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

    const checkName = await Category.findOne({ name });
    if (checkName) {
      return res.error("Danh mục đã tồn tại", 400);
    }

    const newCategory = await new Category({ name, description }).save();
    return res.success({ data: newCategory }, "Tạo danh mục thành công", 201);
  } catch (error) {
    console.error(error);
    return res.error("Tạo danh mục thất bại", 400);
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const { error } = categoryValidate.validate(req.body);
    if (error) {
      return res.error(
        error.details.map((err) => err.message),
        400
      );
    }

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
      return res.error("Không tìm thấy danh mục", 404);
    }

    return res.success(
      { data: updatedCategory },
      "Cập nhật danh mục thành công"
    );
  } catch (error) {
    return res.error("Cập nhật danh mục thất bại", 400);
  }
};
