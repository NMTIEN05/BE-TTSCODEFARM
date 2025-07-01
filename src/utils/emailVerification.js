export const generateVerificationOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateRandomPassword = () => {
  // Tạo mật khẩu ngẫu nhiên có độ dài 10 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};