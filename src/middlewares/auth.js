// middlewares/auth.js
import jwt from "jsonwebtoken";
import User from "../model/User.js";

export const protect = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else {
    return res.status(401).json({ message: "Bạn cần đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // {id, isAdmin}
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Chỉ admin mới được phép truy cập" });
  }
};

export const isSelfOrAdmin = (req, res, next) => {
  // Dùng khi user chỉ được chỉnh info của mình hoặc admin được chỉnh tất cả
  if (req.user && (req.user.isAdmin || req.user.id === req.params.id)) {
    next();
  } else {
    res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này" });
  }
};
