// src/models/Category.model.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
