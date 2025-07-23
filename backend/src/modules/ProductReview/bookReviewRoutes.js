import express from "express";
import {
  createReview,
  getReviewsByBook,
} from "./bookReviewController.js";

const bookReviewRouter = express.Router();

bookReviewRouter.post("/book-reviews/add", createReview);
bookReviewRouter.get("/book-review/:book_id", getReviewsByBook);

export default bookReviewRouter;
