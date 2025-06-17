import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    author_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    publisher: {
      type: String,
      required: true,
    },
    publish_year: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock_quantity: {
      type: Number,
      required: true,
    },
    cover_image: {
      type: String,
      
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Book = mongoose.model("Book", bookSchema);
export default Book;
