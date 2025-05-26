import express from "express";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from "../controllers/authorController.js";

const authorRouter = express.Router();

authorRouter.get("/authors", getAuthors);
authorRouter.get("/authors/:id", getAuthorById);
authorRouter.post("/authors/add", createAuthor);
authorRouter.put("/authors/edit/:id", updateAuthor);
authorRouter.delete("/authors/:id", deleteAuthor);

export default authorRouter;
