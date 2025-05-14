import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoriesAll,
  getCategoryById,
  updateCategory,
} from "../controllers/categoryController.js";

const routes = Router();

// Routes category
routes.get("/categories", getCategoriesAll);
routes.get("/categories/:id", getCategoryById);
routes.delete("/categories/:id", deleteCategory);
routes.post("/categories", createCategory);
routes.put("/categories/:id", updateCategory);

export default routes;
