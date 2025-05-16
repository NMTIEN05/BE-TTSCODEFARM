import mongoose from "mongoose";


const bookScheman = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    require: true,
  },
  title: {
    type: String,
    require: true,
    trim: true,
  },
  author_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
    ref: true,
  },
  publisher: {
    type: String,
  },
  publisher_year:  {
    type: String,
  },
  description: {type: String},
  price: {type: String,require: true},
  stock_quantity: {type: Boolean, default:0},
  cover_image: {type:String},
  is_available: {type: Boolean,default: true},

},{timestamps: true, versionKey:false});

const  Book = mongoose.model("Book",bookScheman);
export default Book;