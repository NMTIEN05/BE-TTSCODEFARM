// models/user.model.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
<<<<<<< HEAD
  fullname: {
    type: String,
    required: true,
    trim: true
  },
 phone: {
  type: String,
  required: false  // hoặc xóa dòng required nếu không bắt buộc
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
  isAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const UserModel = mongoose.model('User', userSchema);

export default UserModel;
=======
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
>>>>>>> abc5f5e0d64355d08cfa76d98477bf1dd10a3b95
