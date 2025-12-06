import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import DangNhap from './pages/DangNhap';
import DangKy from './pages/DangKy';
import ResetPassword from './pages/ResetPassword';
import BenhNhan from './pages/BenhNhan';
import BacSi from './pages/BacSi';
import QuanLy from './pages/QuanLy';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App(){
  return (
    <div className="relative min-h-screen">
      <Header />
      <main className="py-6 relative z-10">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/dang-nhap" element={<DangNhap/>} />
          <Route path="/dang-ky" element={<DangKy/>} />
          <Route path="/dat-lai-mat-khau" element={<ResetPassword/>} />
          <Route path="/reset-password" element={<ResetPassword/>} />
          <Route path="/benh-nhan" element={<ProtectedRoute roles={[4]}><BenhNhan/></ProtectedRoute>} />
          <Route path="/bac-si" element={<ProtectedRoute roles={[1, 2]}><BacSi/></ProtectedRoute>} />
          <Route path="/quan-ly" element={<ProtectedRoute roles={[1]}><QuanLy/></ProtectedRoute>} />
          <Route path="*" element={<div className="container py-8">Không tìm thấy trang</div>} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}

