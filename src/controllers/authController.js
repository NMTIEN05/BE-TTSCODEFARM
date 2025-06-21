import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "../model/User.js";
import { registerSchema } from "../validate/auth.js";

async function register(req, res) {
  try {
    const { fullname, email, password } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorsMessage = error.details.map((err) => err.message);
      return res.status(400).json({ message: errorsMessage });
    }

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email existed" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user (bổ sung fullname)
    const newUser = {
      fullname,
      email,
      password: hashedPassword,
    };
    const userCreated = await UserModel.create(newUser);

    // Remove password trong response
    res.json({ ...userCreated.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// updateUser, deleteUser, getAllUsers, getUserById giữ nguyên như bạn viết

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullname, email, phone, role } = req.body;

    // Nếu bạn muốn update isAdmin thì nên check quyền ở middleware, không nên update role trực tiếp

    const user = await UserModel.findByIdAndUpdate(
      id,
      { fullname, email, phone, isAdmin: role === "admin" ? true : false }, // Giả sử role là string "admin" hoặc "user"
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ ...user.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await UserModel.find().select("-password"); // không trả password
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password is Required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password min 6 character" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      "tiendz", // nên dùng process.env.JWT_SECRET
      { expiresIn: "7d" }
    );

    // ✅ Trả về user trong object `user` như frontend mong muốn
    res.json({
      token,
      isAdmin: user.isAdmin,
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export { register, updateUser, getUserById, getAllUsers, login, deleteUser };
