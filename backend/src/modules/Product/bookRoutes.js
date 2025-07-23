import express from "express";
import {
  createBook,
  deleteBook,
  getBookById,
  getBooks,
  updateBook,
  restoreBook,
  forceDeleteBook,
  searchBooks,
  getSearchSuggestions,
} from "./bookController.js";

const bookRouter = express.Router();

bookRouter.post("/books/add", createBook);
bookRouter.get("/books/search", searchBooks); // Route tìm kiếm
bookRouter.get("/books/suggestions", getSearchSuggestions); // Route gợi ý
bookRouter.get("/books", getBooks);
bookRouter.get("/books/:id", getBookById);
bookRouter.put("/books/edit/:id", updateBook);
bookRouter.delete("/books/:id", deleteBook);
bookRouter.patch("/books/:id/restore", restoreBook);
bookRouter.delete("/books/:id/force", forceDeleteBook);

export default bookRouter;
