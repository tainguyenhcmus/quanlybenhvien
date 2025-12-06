import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TableDanhSach from '../components/TableDanhSach';
import MedicalRecord from '../components/MedicalRecord';
import { 
  FaShieldAlt, FaCalendarAlt, FaUsers, FaUserMd, FaCheckCircle, FaTimesCircle, 
  FaSync, FaChartLine, FaUser, FaHospital, FaEdit, FaTrash, FaPlus,
  FaUserFriends, FaStethoscope, FaFileMedical, FaDollarSign, FaClock,
  FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';

export default function QuanLy(){
  const [activeTab, setActiveTab] = useState('dashboard');
  const [lich, setLich] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [hoSo, setHoSo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorForm, setDoctorForm] = useState({ hoTen: '', chuyenKhoa: '', bacSiCode: '', sdt: '', email: '' });
  const [selectedHoSo, setSelectedHoSo] = useState(null);
  const [showCustomSpecialty, setShowCustomSpecialty] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [lichRes, usersRes, doctorsRes, patientsRes, hoSoRes] = await Promise.all([
        api.get('/lichkham'),
        api.get('/auth/users'),
        api.get('/bacsi'),
        api.get('/benhnhan'),
        api.get('/hosobenhan')
      ]);
      setLich(lichRes.data);
      setUsers(usersRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setHoSo(hoSoRes.data);
    } catch(e) {
      console.error('Error loading data:', e);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (maLich, trangThai) => {
    try {
      setUpdating(maLich);
      await api.put(`/lichkham/${maLich}/trangthai`, { TrangThai: trangThai });
      toast.success('Đã cập nhật trạng thái thành công');
      await loadAllData();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bác sĩ này?')) return;
    try {
      await api.delete(`/bacsi/${id}`);
      toast.success('Xóa bác sĩ thành công');
      await loadAllData();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (editingDoctor) {
        await api.put(`/bacsi/${editingDoctor.MaBacSi}`, doctorForm);
        toast.success('Cập nhật bác sĩ thành công');
      } else {
        await api.post('/bacsi', doctorForm);
        toast.success('Thêm bác sĩ thành công');
      }
      setShowDoctorModal(false);
      setEditingDoctor(null);
      setDoctorForm({ hoTen: '', chuyenKhoa: '', bacSiCode: '', sdt: '', email: '' });
      setShowCustomSpecialty(false);
      await loadAllData();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleEditDoctor = (doctor) => {
    setEditingDoctor(doctor);
    const chuyenKhoa = doctor.ChuyenKhoa || '';
    const specialtyOptions = [
      'Tim mạch', 'Nội khoa', 'Ngoại khoa', 'Nhi khoa', 'Sản phụ khoa',
      'Da liễu', 'Mắt', 'Tai mũi họng', 'Răng hàm mặt', 'Thần kinh',
      'Tâm thần', 'Ung bướu', 'Y học cổ truyền', 'Phục hồi chức năng',
      'Gây mê hồi sức', 'Chẩn đoán hình ảnh', 'Xét nghiệm', 'Dược'
    ];
    setShowCustomSpecialty(chuyenKhoa && !specialtyOptions.includes(chuyenKhoa));
    setDoctorForm({
      hoTen: doctor.HoTen || '',
      chuyenKhoa: chuyenKhoa,
      bacSiCode: doctor.BacSiCode || '',
      sdt: doctor.SDT || '',
      email: doctor.Email || ''
    });
    setShowDoctorModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Đã xác nhận': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Hủy': 'bg-red-100 text-red-800'
    };
    const className = statusMap[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
        {status || 'Chưa xác định'}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      1: { text: 'Quản lý', color: 'bg-purple-100 text-purple-800' },
      2: { text: 'Bác sĩ', color: 'bg-blue-100 text-blue-800' },
      3: { text: 'Nhân viên', color: 'bg-gray-100 text-gray-800' },
      4: { text: 'Bệnh nhân', color: 'bg-green-100 text-green-800' }
    };
    const roleInfo = roleMap[role] || { text: 'Không xác định', color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}>
        {roleInfo.text}
      </span>
    );
  };

  const tabs = [
    { id: 'dashboard', label: 'Tổng quan', icon: FaChartLine },
    { id: 'appointments', label: 'Lịch khám', icon: FaCalendarAlt },
    { id: 'records', label: 'Hồ sơ bệnh án', icon: FaFileMedical },
    { id: 'users', label: 'Tài khoản', icon: FaUser },
    { id: 'doctors', label: 'Bác sĩ', icon: FaStethoscope },
    { id: 'patients', label: 'Bệnh nhân', icon: FaUserFriends }
  ];

  return (
    <div className="min-h-screen relative py-8" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 15s ease infinite'
    }}>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
      <div className="container relative z-10">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/20">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform">
              <FaShieldAlt className="text-white text-3xl" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Bảng quản trị
              </h1>
              <p className="text-gray-700 font-medium">Quản lý toàn bộ hệ thống bệnh viện</p>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200/50 overflow-x-auto bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSelectedHoSo(null);
                  }}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 whitespace-nowrap relative ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-white bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                      : 'border-transparent text-gray-700 hover:text-purple-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className={activeTab === tab.id ? 'text-white' : ''} />
                  <span>{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/50"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Tổng lịch khám</p>
                    <p className="text-4xl font-bold text-white mb-1">{lich.length}</p>
                    <p className="text-xs text-blue-200 mt-1">
                      {lich.filter(l => new Date(l.NgayKham) >= new Date()).length} sắp tới
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaCalendarAlt className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Bệnh nhân</p>
                    <p className="text-4xl font-bold text-white mb-1">{patients.length}</p>
                    <p className="text-xs text-emerald-200 mt-1">
                      {users.filter(u => u.MaChucVu === 4).length} tài khoản
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaUserFriends className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-purple-500 via-pink-600 to-rose-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Bác sĩ</p>
                    <p className="text-4xl font-bold text-white mb-1">{doctors.length}</p>
                    <p className="text-xs text-purple-200 mt-1">
                      {users.filter(u => u.MaChucVu === 2).length} tài khoản
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaStethoscope className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-orange-500 via-amber-600 to-yellow-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Hồ sơ bệnh án</p>
                    <p className="text-4xl font-bold text-white mb-1">{hoSo.length}</p>
                    <p className="text-xs text-orange-200 mt-1">
                      {lich.filter(l => l.TrangThai === 'Đã khám' || l.TrangThai === 'Hoàn thành').length} đã khám
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaFileMedical className="text-3xl text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-600 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm font-medium mb-1">Lịch đã đặt</p>
                    <p className="text-4xl font-bold text-white">
                      {lich.filter(l => l.TrangThai === 'Đã đặt').length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaClock className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Lịch đã hủy</p>
                    <p className="text-4xl font-bold text-white">
                      {lich.filter(l => l.TrangThai === 'Đã hủy' || l.TrangThai === 'Hủy').length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaTimesCircle className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Đã hoàn thành</p>
                    <p className="text-4xl font-bold text-white">
                      {lich.filter(l => l.TrangThai === 'Hoàn thành' || l.TrangThai === 'Đã khám').length}
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaCheckCircle className="text-3xl text-white" />
                  </div>
                </div>
              </div>
              <div className="relative bg-gradient-to-br from-indigo-500 via-violet-600 to-purple-700 p-6 rounded-2xl shadow-2xl transform hover:scale-105 transition-all overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-indigo-100 text-sm font-medium mb-1">Tổng tài khoản</p>
                    <p className="text-4xl font-bold text-white mb-1">{users.length}</p>
                    <p className="text-xs text-indigo-200 mt-1">
                      {users.filter(u => u.MaChucVu === 3).length} nhân viên
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-all">
                    <FaUsers className="text-3xl text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts and Lists Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Breakdown */}
              <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <FaChartLine className="text-white" />
                    </div>
                    Phân bổ trạng thái lịch khám
                  </h3>
                <div className="space-y-4">
                  {[
                    { status: 'Đã đặt', count: lich.filter(l => l.TrangThai === 'Đã đặt').length, gradient: 'from-yellow-400 via-amber-500 to-orange-600' },
                    { status: 'Đã khám', count: lich.filter(l => l.TrangThai === 'Đã khám').length, gradient: 'from-blue-400 via-indigo-500 to-purple-600' },
                    { status: 'Hoàn thành', count: lich.filter(l => l.TrangThai === 'Hoàn thành').length, gradient: 'from-emerald-400 via-teal-500 to-cyan-600' },
                    { status: 'Đã hủy', count: lich.filter(l => l.TrangThai === 'Đã hủy' || l.TrangThai === 'Hủy').length, gradient: 'from-red-400 via-rose-500 to-pink-600' }
                  ].map(item => {
                    const percentage = lich.length > 0 ? (item.count / lich.length * 100).toFixed(1) : 0;
                    return (
                      <div key={item.status} className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-semibold text-gray-800">{item.status}</span>
                          <span className="text-sm font-bold bg-white px-3 py-1 rounded-full shadow-sm">{item.count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-white rounded-full h-4 shadow-inner overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${item.gradient} h-4 rounded-full transition-all duration-500 shadow-lg`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <FaClock className="text-white" />
                    </div>
                    Lịch khám sắp tới
                  </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {lich
                      .filter(l => {
                        const date = new Date(l.NgayKham);
                        return date >= new Date() && (l.TrangThai === 'Đã đặt' || l.TrangThai === 'Đã xác nhận');
                      })
                      .sort((a, b) => new Date(a.NgayKham) - new Date(b.NgayKham))
                      .slice(0, 5)
                      .map(appointment => (
                        <div key={appointment.MaLich} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl hover:from-blue-100 hover:to-cyan-100 transition-all border border-blue-100 shadow-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800 text-sm mb-1">
                              {appointment.TenBenhNhan || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600 mb-1">
                              {appointment.TenBacSi || 'N/A'} • {appointment.TenPhong || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(appointment.NgayKham).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          <div className="ml-3">
                            {getStatusBadge(appointment.TrangThai)}
                          </div>
                        </div>
                      ))}
                  {lich.filter(l => {
                    const date = new Date(l.NgayKham);
                    return date >= new Date() && (l.TrangThai === 'Đã đặt' || l.TrangThai === 'Đã xác nhận');
                  }).length === 0 && (
                    <p className="text-center text-gray-500 py-8">Không có lịch khám sắp tới</p>
                  )}
                </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-white" />
                  </div>
                  Lịch khám gần đây
                </h3>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Mã</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bệnh nhân</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Bác sĩ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày giờ</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/50">
                    {lich
                      .sort((a, b) => new Date(b.NgayKham) - new Date(a.NgayKham))
                      .slice(0, 10)
                      .map((appointment, index) => (
                        <tr key={appointment.MaLich} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all">
                          <td className="px-4 py-3 text-sm font-mono text-gray-600 font-semibold">#{appointment.MaLich}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-800">{appointment.TenBenhNhan || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{appointment.TenBacSi || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(appointment.NgayKham).toLocaleString('vi-VN')}</td>
                          <td className="px-4 py-3">{getStatusBadge(appointment.TrangThai)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {lich.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Chưa có lịch khám nào</p>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              Quản lý lịch khám
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaLich', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaLich}</span> },
                  { key:'NgayKham', title:'Ngày giờ', render: r => new Date(r.NgayKham).toLocaleString('vi-VN') },
                  { key:'TenBenhNhan', title:'Bệnh nhân', render: r => r.TenBenhNhan || '-' },
                  { key:'TenBacSi', title:'Bác sĩ', render: r => r.TenBacSi || '-' },
                  { key:'TrangThai', title:'Trạng thái', render: r => getStatusBadge(r.TrangThai) }
                ]}
                data={lich}
                actions={(row) => (
                  <div className="flex gap-2">
                    {row.TrangThai !== 'Hoàn thành' && row.TrangThai !== 'Hủy' && (
                      <button
                        onClick={() => updateStatus(row.MaLich, 'Hoàn thành')}
                        disabled={updating === row.MaLich}
                        className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        {updating === row.MaLich ? '...' : 'Hoàn thành'}
                      </button>
                    )}
                    {row.TrangThai !== 'Hủy' && (
                      <button
                        onClick={() => updateStatus(row.MaLich, 'Hủy')}
                        disabled={updating === row.MaLich}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
                        Hủy
                      </button>
                    )}
                  </div>
                )}
              />
            )}
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl">
                  <FaFileMedical className="text-white text-xl" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Quản lý hồ sơ bệnh án</h2>
              </div>
            </div>
            {selectedHoSo ? (
              <div className="space-y-4">
                <MedicalRecord 
                  maLich={selectedHoSo.MaLich} 
                  maBenhNhan={selectedHoSo.MaBenhNhan}
                  canEdit={true}
                  onUpdate={() => {
                    loadAllData();
                    setSelectedHoSo(null);
                  }}
                />
                <button
                  onClick={() => setSelectedHoSo(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
                >
                  ← Quay lại danh sách
                </button>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaHoSo', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaHoSo}</span> },
                  { key:'NgayKham', title:'Ngày khám', render: r => new Date(r.NgayKham).toLocaleString('vi-VN') },
                  { key:'TenBenhNhan', title:'Bệnh nhân', render: r => r.TenBenhNhan || '-' },
                  { key:'TenBacSi', title:'Bác sĩ', render: r => r.TenBacSi || '-' },
                  { key:'ChanDoan', title:'Chẩn đoán', render: r => <span className="line-clamp-1">{r.ChanDoan || '-'}</span> }
                ]}
                data={hoSo}
                actions={(row) => (
                  <button
                    onClick={() => setSelectedHoSo(row)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    Xem chi tiết
                  </button>
                )}
              />
            )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaUser className="text-white text-xl" />
              </div>
              Quản lý tài khoản
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaTaiKhoan', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaTaiKhoan}</span> },
                  { key:'TenDangNhap', title:'Tên đăng nhập', render: r => <span className="font-medium">{r.TenDangNhap}</span> },
                  { key:'HoTen', title:'Họ tên', render: r => r.HoTen || '-' },
                  { key:'Email', title:'Email', render: r => r.Email || '-' },
                  { key:'MaChucVu', title:'Vai trò', render: r => getRoleBadge(r.MaChucVu) }
                ]}
                data={users}
              />
            )}
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FaStethoscope className="text-white text-xl" />
                </div>
                Quản lý bác sĩ
              </h2>
              <button
                onClick={() => {
                  setEditingDoctor(null);
                  setDoctorForm({ hoTen: '', chuyenKhoa: '', bacSiCode: '', sdt: '', email: '' });
                  setShowCustomSpecialty(false);
                  setShowDoctorModal(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaPlus />
                <span>Thêm bác sĩ</span>
              </button>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaBacSi', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaBacSi}</span> },
                  { key:'HoTen', title:'Họ tên', render: r => <span className="font-medium">{r.HoTen}</span> },
                  { key:'ChuyenKhoa', title:'Chuyên khoa', render: r => r.ChuyenKhoa || '-' },
                  { key:'BacSiCode', title:'Mã bác sĩ', render: r => r.BacSiCode || '-' },
                  { key:'SDT', title:'SĐT', render: r => r.SDT || '-' },
                  { key:'Email', title:'Email', render: r => r.Email || '-' }
                ]}
                data={doctors}
                actions={(row)=>(
                  <div className="flex gap-2">
                    <button 
                      className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      onClick={() => handleEditDoctor(row)}
                    >
                      <FaEdit />
                      <span>Sửa</span>
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                      onClick={() => handleDeleteDoctor(row.MaBacSi)}
                    >
                      <FaTrash />
                      <span>Xóa</span>
                    </button>
                  </div>
                )}
              />
            )}
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-200/20 to-emerald-200/20 rounded-full -mr-48 -mt-48"></div>
            <div className="relative z-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <FaUserFriends className="text-white text-xl" />
              </div>
              Quản lý bệnh nhân
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaBenhNhan', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaBenhNhan}</span> },
                  { key:'HoTen', title:'Họ tên', render: r => <span className="font-medium">{r.HoTen}</span> },
                  { key:'SDT', title:'SĐT', render: r => r.SDT || '-' },
                  { key:'Email', title:'Email', render: r => r.Email || '-' },
                  { key:'NgayDangKy', title:'Ngày đăng ký', render: r => new Date(r.NgayDangKy).toLocaleDateString('vi-VN') }
                ]}
                data={patients}
              />
            )}
            </div>
          </div>
        )}

        {showDoctorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {editingDoctor ? 'Sửa thông tin bác sĩ' : 'Thêm bác sĩ mới'}
              </h3>
              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Họ tên *</label>
                  <input
                    type="text"
                    value={doctorForm.hoTen}
                    onChange={e => setDoctorForm({...doctorForm, hoTen: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chuyên khoa</label>
                  {showCustomSpecialty ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Nhập chuyên khoa..."
                        value={doctorForm.chuyenKhoa}
                        onChange={e => setDoctorForm({...doctorForm, chuyenKhoa: e.target.value})}
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomSpecialty(false);
                          setDoctorForm({...doctorForm, chuyenKhoa: ''});
                        }}
                        className="text-sm text-purple-600 hover:text-purple-700"
                      >
                        ← Chọn từ danh sách
                      </button>
                    </div>
                  ) : (
                    <select
                      value={doctorForm.chuyenKhoa}
                      onChange={e => {
                        if (e.target.value === 'Khác') {
                          setShowCustomSpecialty(true);
                          setDoctorForm({...doctorForm, chuyenKhoa: ''});
                        } else {
                          setDoctorForm({...doctorForm, chuyenKhoa: e.target.value});
                        }
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none bg-white"
                    >
                      <option value="">-- Chọn chuyên khoa --</option>
                      <option value="Tim mạch">Tim mạch</option>
                      <option value="Nội khoa">Nội khoa</option>
                      <option value="Ngoại khoa">Ngoại khoa</option>
                      <option value="Nhi khoa">Nhi khoa</option>
                      <option value="Sản phụ khoa">Sản phụ khoa</option>
                      <option value="Da liễu">Da liễu</option>
                      <option value="Mắt">Mắt</option>
                      <option value="Tai mũi họng">Tai mũi họng</option>
                      <option value="Răng hàm mặt">Răng hàm mặt</option>
                      <option value="Thần kinh">Thần kinh</option>
                      <option value="Tâm thần">Tâm thần</option>
                      <option value="Ung bướu">Ung bướu</option>
                      <option value="Y học cổ truyền">Y học cổ truyền</option>
                      <option value="Phục hồi chức năng">Phục hồi chức năng</option>
                      <option value="Gây mê hồi sức">Gây mê hồi sức</option>
                      <option value="Chẩn đoán hình ảnh">Chẩn đoán hình ảnh</option>
                      <option value="Xét nghiệm">Xét nghiệm</option>
                      <option value="Dược">Dược</option>
                      <option value="Khác">Khác...</option>
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mã bác sĩ</label>
                  <input
                    type="text"
                    value={doctorForm.bacSiCode}
                    onChange={e => setDoctorForm({...doctorForm, bacSiCode: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">SĐT</label>
                  <input
                    type="tel"
                    value={doctorForm.sdt}
                    onChange={e => setDoctorForm({...doctorForm, sdt: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={doctorForm.email}
                    onChange={e => setDoctorForm({...doctorForm, email: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-600 outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                  >
                    {editingDoctor ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDoctorModal(false);
                      setEditingDoctor(null);
                      setDoctorForm({ hoTen: '', chuyenKhoa: '', bacSiCode: '', sdt: '', email: '' });
                      setShowCustomSpecialty(false);
                    }}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

