import mongoose from "mongoose";

const authorSchema = new mongoose.Schema({
    name: {
        type:String ,
        require: true,
        trim: true,

    },
    bio: {
        type: String,
        
    },
    birth_date: {
        type: Date,

    },
     nationality: {
        type: String,

     }
},{timestamps: true, versionKey:false});

const Author = mongoose.model("Author",authorSchema);
export default Author;