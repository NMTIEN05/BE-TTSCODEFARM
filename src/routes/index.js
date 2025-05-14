import { Router } from "express";
import { getCategoriesAll } from "../controllers/categoryController.js";

const routes = Router();

// Routes category
routes.get("/categories", getCategoriesAll);

export default routes;
