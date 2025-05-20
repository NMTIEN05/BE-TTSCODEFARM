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
// controllers/user.js
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { fullname, email, phone, role } = req.body;

    // Validate hoặc kiểm tra nếu cần

    const user = await UserModel.findByIdAndUpdate(
      id,
      { fullname, email, phone, role },
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


async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password is Required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password min 6 character" });
    }

    // Tìm user theo email (chỉnh thành UserModel)
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Tạo token JWT
    const token = jwt.sign({ id: user._id }, "tiendz", { expiresIn: "1w" });

    // Remove password trong response
    res.json({ ...user.toObject(), password: undefined, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export { register,updateUser, login, deleteUser };
