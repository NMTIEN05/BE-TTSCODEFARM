import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./User.js";
import { registerSchema, loginSchema } from "./auth.js";

async function register(req, res) {
  try {
    const { fullname, email, password, phone, isAdmin } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm user
    const newUser = {
      fullname,
      email,
      password: hashedPassword,
      phone,
      isAdmin: isAdmin || false
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
    const { fullname, email, phone, isAdmin } = req.body;

    const user = await UserModel.findByIdAndUpdate(
      id,
      { fullname, email, phone, isAdmin },
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

    // Kiểm tra dữ liệu hợp lệ với Joi
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      const errorsMessage = error.details.map((err) => err.message);
      return res.status(400).json({ message: errorsMessage[0] });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Tạo token JWT có thêm isAdmin để phân quyền
    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET || "tiendz",
      { expiresIn: "7d" }
    );

    // Trả về thông tin user và token
    const userResponse = {
      _id: user._id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      token
    };

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { register, updateUser, getUserById, getAllUsers, login, deleteUser };
