import express from "express";
import {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
  restoreAuthor,
  forceDeleteAuthor,
} from "./authorController.js";

const authorRouter = express.Router();

authorRouter.get("/authors", getAuthors);
authorRouter.get("/authors/:id", getAuthorById);
authorRouter.post("/authors/add", createAuthor);
authorRouter.put("/authors/edit/:id", updateAuthor);
authorRouter.delete("/authors/:id", deleteAuthor);
authorRouter.patch("/authors/:id/restore", restoreAuthor);
authorRouter.delete("/authors/:id/force", forceDeleteAuthor);

export default authorRouter;
