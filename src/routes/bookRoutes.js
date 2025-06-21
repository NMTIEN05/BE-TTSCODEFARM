import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
  restoreBook,
} from "../controllers/bookController.js";

const bookRouter = express.Router();

bookRouter.post("/books/add", createBook);
bookRouter.get("/books", getBooks);
bookRouter.get("/books/:id", getBookById);
bookRouter.put("/books/edit/:id", updateBook);
bookRouter.delete("/books/:id", deleteBook);
bookRouter.patch("/books/restore/:id", restoreBook);

export default bookRouter;
