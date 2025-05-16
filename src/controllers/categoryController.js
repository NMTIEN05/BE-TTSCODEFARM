import {
  errorResponse,
  successResponse,
} from "../middlewares/responseHandler.js";
import Book from "../models/Book.js";
import Category from "../models/Category.js";
import { ValidateCategory } from "../validate/categoryValidate.js";

export const getCategorys = async (req, res) => {
  const {
    offset = 0,
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
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Category.countDocuments(query);

    return successResponse(
      res,
      {
        data: categories,
        offset: parseInt(offset),
        limit: parseInt(limit),
        totalItems: total,
        hasMore: parseInt(offset) + parseInt(limit) < total,
      },
      "Lấy danh sách danh mục thành công"
    );
  } catch (error) {
    return errorResponse(res, "Lỗi server khi lấy danh sách danh mục");
  }
};

// Lấy danh mục theo ID
export const getCategoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOne({ _id: id });
    if (!category) {
      return errorResponse(res, "Không tìm thấy danh mục", 404);
    }
    return successResponse(res, { data: category }, "Lấy danh mục thành công");
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Lỗi server khi lấy danh mục");
  }
};

// Xoá danh mục
export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    // Cập nhật tất cả sách
    await Book.updateMany({ category_id: id }, { $set: { category: "" } });

    const deleted = await Category.findOneAndDelete({ _id: id });
    if (!deleted) {
      return errorResponse(res, "Không tìm thấy danh mục", 404);
    }

    // danh mục không xác định
    const uncategorized = {
      _id: null,
      name: "Không xác định",
    };
    return successResponse(
      res,
      { category: uncategorized },
      "Xoá danh mục thành công"
    );
  } catch (error) {
    return errorResponse(res, "Xoá danh mục thất bại");
  }
};

// Tạo mới danh mục
export const createCategory = async (req, res) => {
  const { name, description } = req.body;

  try {
    // validate
    const { error } = ValidateCategory.validate(req.body);
    if (error) {
      return errorResponse(
        res,
        error.details.map((err) => err.message),
        400
      );
    }
    const checkName = await Category.findOne({ name });
    if (checkName) {
      return errorResponse(res, "Danh mục đã tồn tại", 400);
    }

    const newCategory = await new Category({ name, description }).save();
    return successResponse(
      res,
      { data: newCategory },
      "Tạo danh mục thành công",
      201
    );
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Tạo danh mục thất bại", 400);
  }
};

// Cập nhật danh mục
export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // validate
    const { error } = ValidateCategory.validate(req.body);
    if (error) {
      return errorResponse(
        res,
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
      return errorResponse(res, "Không tìm thấy danh mục", 404);
    }

    return successResponse(
      res,
      { data: updatedCategory },
      "Cập nhật danh mục thành công"
    );
  } catch (error) {
    return errorResponse(res, "Cập nhật danh mục thất bại", 400);
  }
};
