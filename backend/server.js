// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// KHÔNG require routes trước khi tạo app
const app = express();
app.use(cors());
app.use(express.json());

// routes dưới dạng require tường minh (không gọi ngay khi require trả về object lạ)
const authRoutes = require('./routes/auth.routes');
const benhnhanRoutes = require('./routes/benhnhan.routes');
const bacsiRoutes = require('./routes/bacsi.routes');
const lichkhamRoutes = require('./routes/lichkham.routes');
const hoadonRoutes = require('./routes/hoadon.routes');
const hosobenhanRoutes = require('./routes/hosobenhan.routes');

// mount routes (mỗi require phải trả về một Router function)
app.use('/api/auth', authRoutes);
app.use('/api/benhnhan', benhnhanRoutes);
app.use('/api/bacsi', bacsiRoutes);
app.use('/api/lichkham', lichkhamRoutes);
app.use('/api/hoadon', hoadonRoutes);
app.use('/api/hosobenhan', hosobenhanRoutes);

// health check (sử dụng db bên trong route / controller khi cần)
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`🚀 Server chạy trên port ${PORT}`));
