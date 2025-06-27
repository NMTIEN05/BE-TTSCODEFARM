import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryById,
  getCategorys,
  updateCategory,
  restoreCategory,
  forceDeleteCategory,
} from "./categoryController.js";
const categoryRouter = express.Router();

// Category routes
categoryRouter.get("/categories", getCategorys);
categoryRouter.get("/categories/:id", getCategoryById);
categoryRouter.delete("/categories/:id", deleteCategory);
categoryRouter.patch("/categories/:id/restore", restoreCategory);
categoryRouter.delete("/categories/:id/force", forceDeleteCategory);
categoryRouter.post("/categories/add", createCategory);
categoryRouter.put("/categories/edit/:id", updateCategory);

export default categoryRouter;
