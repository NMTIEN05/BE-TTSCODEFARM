import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
} from "./bookController.js";

const bookRouter = express.Router();

bookRouter.post("/books/add", createBook);
bookRouter.get("/books", getBooks);
bookRouter.get("/books/:id", getBookById);
bookRouter.put("/books/edit/:id", updateBook);
bookRouter.delete("/books/:id", deleteBook);

export default bookRouter;
