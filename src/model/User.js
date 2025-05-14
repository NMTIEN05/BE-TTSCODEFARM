import mongoose  from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    isAdmin:{
        type:Boolean,
        default:false
    }
}, { timestamps: true, versionKey: false })
const User = mongoose.model("User", userSchema);
export default User;