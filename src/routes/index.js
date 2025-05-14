import { Router } from "express";
import {
  deleteCategory,
  getCategoriesAll,
  getCategoryById,
} from "../controllers/categoryController.js";

const routes = Router();

// Routes category
routes.get("/categories", getCategoriesAll);
routes.get("/categories/:id", getCategoryById);
routes.delete("/categories/:id", deleteCategory);

export default routes;
