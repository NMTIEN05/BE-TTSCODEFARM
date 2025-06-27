import mongoose from "mongoose";

const authorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    bio: {
      type: String,
      require: true,
    },
    birth_date: {
      type: Date,
      require: true,
    },
    nationality: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
);

const Authors = mongoose.model("Author", authorSchema);
export default Authors;
