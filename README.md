# Hướng dẫn cài đặt nhanh
1. Giải nén `QuanLyBenhVien.zip` vào một folder dự án.
2. Thêm file hình nền vào `public/images/hospital-bg.jpg` (hoặc đổi tên trong Home.jsx).
3. Frontend: cài dependencies
```bash
cd frontend
npm install
npm install framer-motion react-router-dom
npm install tailwindcss@latest postcss@latest autoprefixer@latest
# (nếu dùng CRA, setup Tailwind theo docs)
npm start
```
4. Backend (Node.js + Express) - ví dụ nhỏ (chạy song song):
```bash
cd backend
npm install express mssql bcrypt jsonwebtoken cors
node server.js
```
5. Kiểm tra DB: `TaiKhoan` đã có `admin` với mật khẩu `Admin@123` (hash bcrypt). Nếu DB khác, dùng endpoint `/api/dev/create-demo` trong server để tạo tài khoản demo.