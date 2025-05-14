import mongoose from "mongoose";
const productShema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    price: {
        type: Number,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    categoryId:{
        type:String,
        required:true
    }
 },{timestamps:true , versionKey:false})
const Product = mongoose.model("Contact", contactShema);
export default Contact;