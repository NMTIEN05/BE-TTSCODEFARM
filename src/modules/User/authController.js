import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import UserModel from "./User.js";
import { registerSchema, loginSchema } from "./auth.js";
import { sendEmail } from "../../utils/sendMail.js";
import { generateVerificationOTP } from "../../utils/emailVerification.js";
import { FRONTEND_URL } from "../../configs/enviroments.js";

async function register(req, res) {
  try {
    const { fullname, email, password, phone, isAdmin } = req.body;

    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo OTP xác thực email
    const verificationOTP = generateVerificationOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    // Thêm user
    const newUser = {
      fullname,
      email,
      password: hashedPassword,
      phone,
      isAdmin: isAdmin || false,
      emailVerificationOTP: verificationOTP,
      emailVerificationExpires: verificationExpires
    };
    const userCreated = await UserModel.create(newUser);

    // Gửi email chứa OTP
    const emailSubject = "Mã xác thực tài khoản";
    const emailText = `Chào ${fullname},\n\nMã xác thực tài khoản của bạn là: ${verificationOTP}\n\nMã có hiệu lực trong 10 phút.`;
    
    await sendEmail(email, emailSubject, emailText);

    res.json({ 
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.",
      user: { ...userCreated.toObject(), password: undefined, emailVerificationOTP: undefined }
    });
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

    // Kiểm tra dữ liệu hợp lệ
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password is Required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password min 6 character" });
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    // Kiểm tra email đã xác thực chưa
    if (!user.isEmailVerified) {
      return res.status(401).json({ message: "Vui lòng xác thực email trước khi đăng nhập" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      "tiendz", // tốt hơn bạn nên lấy từ process.env.JWT_SECRET
      { expiresIn: "7d" }
    );

    res.json({ ...user.toObject(), password: undefined, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, otp } = req.body;

    const user = await UserModel.findOne({
      email,
      emailVerificationOTP: otp,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn" });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Tài khoản đã được xác thực" });
    }

    // Tạo OTP mới
    const verificationOTP = generateVerificationOTP();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationOTP = verificationOTP;
    user.emailVerificationExpires = verificationExpires;
    await user.save();

    // Gửi email chứa OTP
    const emailSubject = "Mã xác thực tài khoản";
    const emailText = `Chào ${user.fullname},\n\nMã xác thực tài khoản của bạn là: ${verificationOTP}\n\nMã có hiệu lực trong 10 phút.`;
    
    await sendEmail(email, emailSubject, emailText);

    res.json({ message: "Email xác thực đã được gửi lại" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


export { register, updateUser, getUserById, getAllUsers, login, deleteUser, verifyEmail, resendVerificationEmail };
