import Book from "../Product/Book.js";
import Category from "./Category.js";
import { categoryValidate } from "./categoryValidate.js";

export const getCategorys = async (req, res) => {
  let {
    offset = "0",
    limit = "7",
    name,
    sortBy = "created_at",
    order = "desc",
    includeDeleted = false,
  } = req.query;

  const page = Math.max(parseInt(offset), 0);
  const perPage = Math.max(parseInt(limit), 1);

  const query = {};
  if (name) {
    query.name = { $regex: name, $options: "i" };
  }

  // Lọc theo trạng thái xóa
  if (includeDeleted === 'true') {
    query.deleted_at = { $ne: null };
  } else {
    query.deleted_at = { $eq: null };
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
    const category = await Category.findOne({ _id: id, deleted_at: null });
    if (!category) {
      return res.error("Không tìm thấy danh mục", 404);
    }

    const books = await Book.find({ category_id: id, deleted_at: null }).populate("category_id");

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
    const deletedCategory = await Category.findOneAndUpdate(
      { _id: id, deleted_at: null },
      { deleted_at: new Date() },
      { new: true }
    );

    if (!deletedCategory) {
      return res.error("Không tìm thấy danh mục", 404);
    }

    return res.success(
      { data: deletedCategory },
      "Xóa danh mục thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa danh mục thất bại");
  }
};

// Khôi phục danh mục
export const restoreCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const restoredCategory = await Category.findOneAndUpdate(
      { _id: id, deleted_at: { $ne: null } },
      { deleted_at: null },
      { new: true }
    );

    if (!restoredCategory) {
      return res.error("Không tìm thấy danh mục đã xóa", 404);
    }

    return res.success(
      { data: restoredCategory },
      "Khôi phục danh mục thành công"
    );
  } catch (error) {
    return res.error("Lỗi server khi khôi phục danh mục", 500);
  }
};

// Xóa vĩnh viễn danh mục
export const forceDeleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOneAndDelete({ _id: id, deleted_at: { $ne: null } });

    if (!category) {
      return res.error("Không tìm thấy danh mục đã xóa", 404);
    }

    return res.success(
      { data: category },
      "Xóa vĩnh viễn danh mục thành công"
    );
  } catch (error) {
    console.error(error);
    return res.error("Xóa vĩnh viễn danh mục thất bại");
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
      { _id: id, deleted_at: null },
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
