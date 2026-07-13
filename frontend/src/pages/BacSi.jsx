import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import TableDanhSach from '../components/TableDanhSach';
import MedicalRecord from '../components/MedicalRecord';
import CalendarLichTruc from '../components/CalendarLichTruc';
import LichSuLichTrucPanel from '../components/LichSuLichTrucPanel';
import { FaUserMd, FaCalendarAlt, FaUsers, FaClock, FaFileMedical, FaPlus, FaTrash, FaExchangeAlt, FaHandPaper, FaCheck, FaTimes, FaList } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDateVN, todayKey, toDateKey } from '../utils/date';

export default function BacSi(){
  const location = useLocation();
  const [lich, setLich] = useState([]);
  const [hoSo, setHoSo] = useState([]);
  const [lichTruc, setLichTruc] = useState([]);
  const [phongKham, setPhongKham] = useState([]);
  const [bacSiHienTai, setBacSiHienTai] = useState(null);
  const [doctorsCungKhoa, setDoctorsCungKhoa] = useState([]);
  const [caDoi, setCaDoi] = useState([]);
  const [yeuCauHoanDoi, setYeuCauHoanDoi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLich, setSelectedLich] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDangKyModal, setShowDangKyModal] = useState(false);
  const [showHoanDoiModal, setShowHoanDoiModal] = useState(false);
  const [hoanDoiLoai, setHoanDoiLoai] = useState('Nhuong');
  const [oncallView, setOncallView] = useState('calendar');
  const [lichSuRefreshKey, setLichSuRefreshKey] = useState(0);
  const [dangKyForm, setDangKyForm] = useState({ MaPhong: '', NgayTruc: '', CaTruc: 'Sáng', GhiChu: '' });
  const [hoanDoiForm, setHoanDoiForm] = useState({ MaLichTrucGui: '', MaBacSiNhan: '', MaLichTrucNhan: '', GhiChu: '' });

  const loadData = async () => {
    try {
      setLoading(true);
      const [lichRes, hoSoRes, lichTrucRes, phongRes, cungKhoaRes, caDoiRes, hoanDoiRes] = await Promise.all([
        api.get('/lichkham'),
        api.get('/hosobenhan'),
        api.get('/lichtruc'),
        api.get('/phongkham'),
        api.get('/bacsi/cung-khoa').catch(() => ({ data: { bacSi: null, dongNghiep: [] } })),
        api.get('/lichtruc/ca-doi').catch(() => ({ data: [] })),
        api.get('/hoandoi').catch(() => ({ data: [] }))
      ]);
      setLich(lichRes.data);
      setHoSo(hoSoRes.data);
      setLichTruc(lichTrucRes.data);
      setPhongKham(phongRes.data);
      setBacSiHienTai(cungKhoaRes.data.bacSi || null);
      setDoctorsCungKhoa(cungKhoaRes.data.dongNghiep || []);
      setCaDoi(caDoiRes.data);
      setYeuCauHoanDoi(hoanDoiRes.data);
      setLichSuRefreshKey((k) => k + 1);
    } catch(e){
      console.error('Error loading data:', e);
      toast.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleDangKyTruc = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lichtruc', {
        MaPhong: dangKyForm.MaPhong ? parseInt(dangKyForm.MaPhong) : null,
        NgayTruc: dangKyForm.NgayTruc,
        CaTruc: dangKyForm.CaTruc,
        GhiChu: dangKyForm.GhiChu
      });
      toast.success('Đăng ký ca trực thành công, chờ quản trị viên duyệt');
      setShowDangKyModal(false);
      setDangKyForm({ MaPhong: '', NgayTruc: '', CaTruc: 'Sáng', GhiChu: '' });
      await loadData();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Đăng ký thất bại');
    }
  };

  const handleHuyDangKy = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy đăng ký ca trực này?')) return;
    try {
      await api.delete(`/lichtruc/${id}`);
      toast.success('Đã hủy đăng ký ca trực');
      await loadData();
    } catch(err) {
      toast.error(err?.response?.data?.message || 'Hủy đăng ký thất bại');
    }
  };

  const myMaBacSi = bacSiHienTai?.MaBacSi ?? lichTruc[0]?.MaBacSi;
  const myChuyenKhoa = bacSiHienTai?.ChuyenKhoa;
  const today = todayKey();
  const caDangChoHoanDoi = new Set(
    yeuCauHoanDoi
      .filter((y) => ['Chờ xác nhận', 'Chờ duyệt'].includes(y.TrangThai))
      .flatMap((y) => [y.MaLichTrucGui, y.MaLichTrucNhan].filter(Boolean))
  );
  const coTheNhuongHoanDoi = (lt) =>
    lt.TrangThai === 'Đã duyệt'
    && toDateKey(lt.NgayTruc) >= today
    && !caDangChoHoanDoi.has(lt.MaLichTruc);
  const caDaDuyet = lichTruc.filter(coTheNhuongHoanDoi);
  const otherDoctors = doctorsCungKhoa;
  const caDoiTheoBacSi = caDoi.filter((c) => c.MaBacSi === parseInt(hoanDoiForm.MaBacSiNhan));
  const coTheHoanDoi = Boolean(myChuyenKhoa) && otherDoctors.length > 0;
  const yeuCauGuiDi = yeuCauHoanDoi.filter((y) => y.MaBacSiGui === myMaBacSi);
  const yeuCauNhanDuoc = yeuCauHoanDoi.filter((y) => y.MaBacSiNhan === myMaBacSi);

  const openHoanDoiModal = (loai, maLichTrucGui = '') => {
    setHoanDoiLoai(loai);
    setHoanDoiForm({ MaLichTrucGui: maLichTrucGui?.toString() || '', MaBacSiNhan: '', MaLichTrucNhan: '', GhiChu: '' });
    setShowHoanDoiModal(true);
  };

  const handleGuiYeuCau = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hoandoi', {
        LoaiYeuCau: hoanDoiLoai,
        MaLichTrucGui: parseInt(hoanDoiForm.MaLichTrucGui),
        MaBacSiNhan: parseInt(hoanDoiForm.MaBacSiNhan),
        MaLichTrucNhan: hoanDoiLoai === 'HoanDoi' ? parseInt(hoanDoiForm.MaLichTrucNhan) : null,
        GhiChu: hoanDoiForm.GhiChu
      });
      toast.success('Đã gửi yêu cầu, chờ bác sĩ đối tác xác nhận');
      setShowHoanDoiModal(false);
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gửi yêu cầu thất bại');
    }
  };

  const handleXacNhanYeuCau = async (id) => {
    try {
      await api.put(`/hoandoi/${id}/xacnhan`);
      toast.success('Đã xác nhận — lịch trực chưa đổi, chờ quản trị viên duyệt');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Xác nhận thất bại');
    }
  };

  const handleTuChoiYeuCau = async (id) => {
    if (!window.confirm('Bạn có chắc muốn từ chối yêu cầu này?')) return;
    try {
      await api.put(`/hoandoi/${id}/tuchoi`);
      toast.success('Đã từ chối yêu cầu');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleHuyYeuCau = async (id) => {
    if (!window.confirm('Bạn có chắc muốn hủy yêu cầu này?')) return;
    try {
      await api.put(`/hoandoi/${id}/huy`);
      toast.success('Đã hủy yêu cầu');
      await loadData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Hủy yêu cầu thất bại');
    }
  };

  const formatCaTruc = (ngay, ca) => `${formatDateVN(ngay)} - ${ca}`;

  const getHoanDoiStatusBadge = (status) => {
    const map = {
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Chờ duyệt': 'bg-blue-100 text-blue-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800',
      'Hủy': 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (location.state?.openTab === 'oncall') {
      setActiveTab('oncall');
    }
  }, [location.state]);

  useEffect(() => {
    const onOpen = () => {
      setActiveTab('oncall');
      loadData();
    };
    window.addEventListener('app:open-oncall', onOpen);
    return () => window.removeEventListener('app:open-oncall', onOpen);
  }, []);

  const getStatusBadge = (status) => {
    const statusMap = {
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Đã xác nhận': 'bg-blue-100 text-blue-800',
      'Hoàn thành': 'bg-green-100 text-green-800',
      'Hủy': 'bg-red-100 text-red-800',
      'Chờ duyệt': 'bg-yellow-100 text-yellow-800',
      'Đã duyệt': 'bg-green-100 text-green-800',
      'Từ chối': 'bg-red-100 text-red-800',
      'Chờ xác nhận': 'bg-yellow-100 text-yellow-800',
      'Hủy': 'bg-gray-100 text-gray-800'
    };
    const className = statusMap[status] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${className}`}>
        {status || 'Chưa xác định'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-8">
      <div className="container">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaUserMd className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển bác sĩ</h1>
              <p className="text-gray-600">Quản lý lịch khám bệnh nhân</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Tổng lịch khám</p>
                <p className="text-3xl font-bold text-gray-800">{lich.length}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-red-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Chờ xác nhận</p>
                <p className="text-3xl font-bold text-gray-800">
                  {lich.filter(l => l.TrangThai === 'Chờ xác nhận').length}
                </p>
              </div>
              <FaClock className="text-4xl text-yellow-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Đã xác nhận</p>
                <p className="text-3xl font-bold text-gray-800">
                  {lich.filter(l => l.TrangThai === 'Đã xác nhận').length}
                </p>
              </div>
              <FaUsers className="text-4xl text-blue-500 opacity-20" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Hoàn thành</p>
                <p className="text-3xl font-bold text-gray-800">
                  {lich.filter(l => l.TrangThai === 'Hoàn thành').length}
                </p>
              </div>
              <FaCalendarAlt className="text-4xl text-green-500 opacity-20" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('appointments');
                setSelectedLich(null);
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaCalendarAlt />
              <span>Lịch khám</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('records');
                setSelectedLich(null);
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'records'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaFileMedical />
              <span>Hồ sơ bệnh án</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('oncall');
                setSelectedLich(null);
              }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'oncall'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              <FaClock />
              <span>Lịch trực</span>
            </button>
          </div>
        </div>

        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <FaCalendarAlt className="text-white text-xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Danh sách lịch khám</h2>
            </div>
            {loading ? (
              <div className="text-center py-12">
                <svg className="animate-spin h-8 w-8 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <TableDanhSach
                columns={[
                  { key:'MaLich', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaLich}</span> },
                  { key:'NgayKham', title:'Ngày giờ', render: r => (
                    <div>
                      <div className="font-medium">{new Date(r.NgayKham).toLocaleDateString('vi-VN')}</div>
                      <div className="text-xs text-gray-500">{new Date(r.NgayKham).toLocaleTimeString('vi-VN')}</div>
                    </div>
                  )},
                  { key:'TenBenhNhan', title:'Bệnh nhân', render: r => <span className="font-medium">{r.TenBenhNhan}</span> },
                  { key:'TrangThai', title:'Trạng thái', render: r => getStatusBadge(r.TrangThai) }
                ]}
                data={lich}
                actions={(row) => (
                  <button
                    onClick={() => {
                      setSelectedLich(row.MaLich);
                      setActiveTab('records');
                    }}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                  >
                    <FaFileMedical />
                    <span>{row.TrangThai === 'Hoàn thành' ? 'Xem/Sửa hồ sơ' : 'Tạo hồ sơ'}</span>
                  </button>
                )}
              />
            )}
          </div>
        )}

        {activeTab === 'oncall' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <div>
                  <h2 className="text-2xl font-bold text-gray-800">Lịch trực của tôi</h2>
                  <p className="text-sm text-gray-500">
                    {myChuyenKhoa
                      ? `Khoa: ${myChuyenKhoa} — chỉ nhượng/hoán đổi với bác sĩ cùng khoa`
                      : 'Chưa có thông tin khoa — liên hệ quản trị viên để cập nhật chuyên khoa'}
                  </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => openHoanDoiModal('Nhuong')}
                    disabled={caDaDuyet.length === 0 || !coTheHoanDoi}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <FaHandPaper />
                    <span>Nhượng ca</span>
                  </button>
                  <button
                    onClick={() => openHoanDoiModal('HoanDoi')}
                    disabled={caDaDuyet.length === 0 || !coTheHoanDoi}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <FaExchangeAlt />
                    <span>Hoán đổi ca</span>
                  </button>
                  <button
                    onClick={() => {
                      setDangKyForm({ MaPhong: '', NgayTruc: '', CaTruc: 'Sáng', GhiChu: '' });
                      setShowDangKyModal(true);
                    }}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <FaPlus />
                    <span>Đăng ký ca trực</span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setOncallView('calendar')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    oncallView === 'calendar' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaCalendarAlt /> Lịch tháng
                </button>
                <button
                  type="button"
                  onClick={() => setOncallView('list')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                    oncallView === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FaList /> Danh sách
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-8 w-8 text-orange-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                </div>
              ) : oncallView === 'calendar' ? (
                <CalendarLichTruc
                  data={lichTruc}
                  showDoctor={false}
                  renderDayActions={(items) => (
                    <div className="flex gap-2 flex-wrap">
                      {items.filter((i) => i.TrangThai === 'Chờ duyệt').map((item) => (
                        <button
                          key={`huy-${item.MaLichTruc}`}
                          onClick={() => handleHuyDangKy(item.MaLichTruc)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                        >
                          <FaTrash /> Hủy đăng ký
                        </button>
                      ))}
                      {items.some(coTheNhuongHoanDoi) && coTheHoanDoi && (
                        <>
                          <button
                            onClick={() => openHoanDoiModal('Nhuong', items.find(coTheNhuongHoanDoi)?.MaLichTruc)}
                            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                          >
                            <FaHandPaper /> Nhượng
                          </button>
                          <button
                            onClick={() => openHoanDoiModal('HoanDoi', items.find(coTheNhuongHoanDoi)?.MaLichTruc)}
                            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                          >
                            <FaExchangeAlt /> Hoán đổi
                          </button>
                        </>
                      )}
                    </div>
                  )}
                />
              ) : lichTruc.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <FaClock className="text-4xl mx-auto mb-2 opacity-50" />
                  <p>Chưa có lịch trực nào</p>
                </div>
              ) : (
                <TableDanhSach
                  columns={[
                    { key:'MaLichTruc', title:'Mã', render: r => <span className="font-mono text-sm">#{r.MaLichTruc}</span> },
                    { key:'NgayTruc', title:'Ngày trực', render: r => formatDateVN(r.NgayTruc) },
                    { key:'CaTruc', title:'Ca trực', render: r => (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">{r.CaTruc}</span>
                    )},
                    { key:'TenPhong', title:'Phòng/Khoa', render: r => r.TenPhong || '-' },
                    { key:'TrangThai', title:'Trạng thái', render: r => getStatusBadge(r.TrangThai) },
                    { key:'GhiChu', title:'Ghi chú', render: r => r.GhiChu || '-' }
                  ]}
                  data={lichTruc}
                  actions={(row) => (
                    <div className="flex gap-2 flex-wrap">
                      {row.TrangThai === 'Chờ duyệt' && (
                        <button
                          onClick={() => handleHuyDangKy(row.MaLichTruc)}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                        >
                          <FaTrash />
                          <span>Hủy</span>
                        </button>
                      )}
                      {row.TrangThai === 'Đã duyệt' && coTheHoanDoi && coTheNhuongHoanDoi(row) && (
                        <>
                          <button
                            onClick={() => openHoanDoiModal('Nhuong', row.MaLichTruc)}
                            className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                          >
                            <FaHandPaper />
                            <span>Nhượng</span>
                          </button>
                          <button
                            onClick={() => openHoanDoiModal('HoanDoi', row.MaLichTruc)}
                            className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1"
                          >
                            <FaExchangeAlt />
                            <span>Hoán đổi</span>
                          </button>
                        </>
                      )}
                      {row.TrangThai === 'Đã duyệt' && caDangChoHoanDoi.has(row.MaLichTruc) && (
                        <span className="text-xs text-blue-600 font-medium">Đang có yêu cầu chờ xử lý</span>
                      )}
                    </div>
                  )}
                />
              )}
            </div>

            {/* Yêu cầu hoán đổi / nhượng ca */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaExchangeAlt className="text-indigo-500" />
                  Yêu cầu gửi đi
                </h3>
                {yeuCauGuiDi.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">Chưa có yêu cầu gửi đi</p>
                ) : (
                  <div className="space-y-3">
                    {yeuCauGuiDi.map((yc) => (
                      <div key={yc.MaYeuCau} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-800">
                            {yc.LoaiYeuCau === 'Nhuong' ? 'Nhượng ca' : 'Hoán đổi ca'}
                          </span>
                          {getHoanDoiStatusBadge(yc.TrangThai)}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">
                          Ca của bạn: {formatCaTruc(yc.NgayTrucGui, yc.CaTrucGui)}
                        </p>
                        {yc.LoaiYeuCau === 'HoanDoi' && yc.NgayTrucNhan && (
                          <p className="text-xs text-gray-600 mb-1">
                            Ca đối tác: {formatCaTruc(yc.NgayTrucNhan, yc.CaTrucNhan)}
                          </p>
                        )}
                        <p className="text-xs text-gray-600 mb-2">Gửi đến: {yc.TenBacSiNhan}</p>
                        {yc.TrangThai === 'Chờ duyệt' && (
                          <p className="text-xs text-blue-600 mb-2">Đối tác đã xác nhận — chờ admin duyệt (lịch chưa đổi)</p>
                        )}
                        {['Chờ xác nhận', 'Chờ duyệt'].includes(yc.TrangThai) && (
                          <button onClick={() => handleHuyYeuCau(yc.MaYeuCau)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Hủy yêu cầu
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaUsers className="text-blue-500" />
                  Yêu cầu nhận được
                </h3>
                {yeuCauNhanDuoc.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-6">Chưa có yêu cầu nhận được</p>
                ) : (
                  <div className="space-y-3">
                    {yeuCauNhanDuoc.map((yc) => (
                      <div
                        key={yc.MaYeuCau}
                        className={`border rounded-lg p-4 ${
                          yc.TrangThai === 'Chờ xác nhận' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm text-gray-800">
                            {yc.LoaiYeuCau === 'Nhuong' ? 'Nhận ca trực' : 'Hoán đổi ca'}
                          </span>
                          {getHoanDoiStatusBadge(yc.TrangThai)}
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Từ: {yc.TenBacSiGui}</p>
                        <p className="text-xs text-gray-600 mb-1">
                          Ca gửi: {formatCaTruc(yc.NgayTrucGui, yc.CaTrucGui)}
                        </p>
                        {yc.LoaiYeuCau === 'HoanDoi' && yc.NgayTrucNhan && (
                          <p className="text-xs text-gray-600 mb-2">
                            Ca của bạn: {formatCaTruc(yc.NgayTrucNhan, yc.CaTrucNhan)}
                          </p>
                        )}
                        {yc.GhiChu && <p className="text-xs text-gray-500 mb-2 italic">{yc.GhiChu}</p>}
                        {yc.TrangThai === 'Chờ duyệt' && (
                          <p className="text-xs text-blue-600 mb-2">Bạn đã xác nhận — chờ admin duyệt (lịch chưa đổi)</p>
                        )}
                        {yc.TrangThai === 'Đã duyệt' && (
                          <p className="text-xs text-green-600 mb-2">Đã duyệt — lịch trực đã được cập nhật</p>
                        )}
                        {yc.TrangThai === 'Chờ xác nhận' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleXacNhanYeuCau(yc.MaYeuCau)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <FaCheck /> Xác nhận
                            </button>
                            <button
                              onClick={() => handleTuChoiYeuCau(yc.MaYeuCau)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1"
                            >
                              <FaTimes /> Từ chối
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <LichSuLichTrucPanel title="Lịch sử ca trực của tôi" refreshKey={lichSuRefreshKey} />
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-6">
            {selectedLich ? (
              <>
                <MedicalRecord 
                  maLich={selectedLich} 
                  maBenhNhan={lich.find(l => l.MaLich === selectedLich)?.MaBenhNhan}
                  canEdit={true}
                  onUpdate={() => {
                    loadData();
                    setSelectedLich(null);
                  }}
                />
                <button
                  onClick={() => setSelectedLich(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
                >
                  ← Quay lại danh sách
                </button>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                      <FaFileMedical className="text-white text-xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Danh sách hồ sơ bệnh án</h2>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <FaFileMedical />
                    <span>Tạo hồ sơ bệnh án mới</span>
                  </button>
                </div>
                {loading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 text-red-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-500">Đang tải dữ liệu...</p>
                  </div>
                ) : hoSo.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FaFileMedical className="text-4xl mx-auto mb-2 opacity-50" />
                    <p>Chưa có hồ sơ bệnh án nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hoSo.map((hs) => (
                      <div 
                        key={hs.MaHoSo} 
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedLich(hs.MaLich)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <FaFileMedical className="text-blue-500" />
                            <span className="font-semibold text-gray-800">
                              Hồ sơ #{hs.MaHoSo} - {new Date(hs.NgayKham).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {hs.TenBenhNhan}
                          </span>
                        </div>
                        {hs.ChanDoan && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            <strong>Chẩn đoán:</strong> {hs.ChanDoan}
                          </p>
                        )}
                        <div className="mt-2 text-xs text-gray-500">
                          Cập nhật: {new Date(hs.NgayCapNhat).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showHoanDoiModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {hoanDoiLoai === 'Nhuong' ? <FaHandPaper className="text-purple-500" /> : <FaExchangeAlt className="text-indigo-500" />}
                  {hoanDoiLoai === 'Nhuong' ? 'Nhượng ca trực' : 'Hoán đổi ca trực'}
                </h3>
                <button onClick={() => setShowHoanDoiModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <form onSubmit={handleGuiYeuCau} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ca trực của bạn *</label>
                  <select
                    value={hoanDoiForm.MaLichTrucGui}
                    onChange={(e) => setHoanDoiForm({ ...hoanDoiForm, MaLichTrucGui: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Chọn ca trực --</option>
                    {caDaDuyet.map((ca) => (
                      <option key={ca.MaLichTruc} value={ca.MaLichTruc}>
                        {formatDateVN(ca.NgayTruc)} - {ca.CaTruc} {ca.TenPhong ? `(${ca.TenPhong})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bác sĩ cùng khoa {myChuyenKhoa ? `(${myChuyenKhoa})` : ''} *
                  </label>
                  <select
                    value={hoanDoiForm.MaBacSiNhan}
                    onChange={(e) => setHoanDoiForm({ ...hoanDoiForm, MaBacSiNhan: e.target.value, MaLichTrucNhan: '' })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="">-- Chọn bác sĩ cùng khoa --</option>
                    {otherDoctors.map((d) => (
                      <option key={d.MaBacSi} value={d.MaBacSi}>{d.HoTen}</option>
                    ))}
                  </select>
                  {otherDoctors.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">Không có bác sĩ khác cùng khoa</p>
                  )}
                </div>
                {hoanDoiLoai === 'HoanDoi' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ca trực đối tác *</label>
                    <select
                      value={hoanDoiForm.MaLichTrucNhan}
                      onChange={(e) => setHoanDoiForm({ ...hoanDoiForm, MaLichTrucNhan: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none bg-white"
                      required
                      disabled={!hoanDoiForm.MaBacSiNhan}
                    >
                      <option value="">-- Chọn ca trực đối tác --</option>
                      {caDoiTheoBacSi.map((ca) => (
                        <option key={ca.MaLichTruc} value={ca.MaLichTruc}>
                          {formatDateVN(ca.NgayTruc)} - {ca.CaTruc} {ca.TenPhong ? `(${ca.TenPhong})` : ''}
                        </option>
                      ))}
                    </select>
                    {hoanDoiForm.MaBacSiNhan && caDoiTheoBacSi.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">Bác sĩ này chưa có ca trực để hoán đổi</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={hoanDoiForm.GhiChu}
                    onChange={(e) => setHoanDoiForm({ ...hoanDoiForm, GhiChu: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none"
                    rows={2}
                    placeholder="Lý do nhượng/hoán đổi ca..."
                  />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium">
                    Gửi yêu cầu
                  </button>
                  <button type="button" onClick={() => setShowHoanDoiModal(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium">
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDangKyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FaClock className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Đăng ký ca trực</h3>
                </div>
                <button
                  onClick={() => setShowDangKyModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <form onSubmit={handleDangKyTruc} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phòng/Khoa</label>
                  <select
                    value={dangKyForm.MaPhong}
                    onChange={e => setDangKyForm({...dangKyForm, MaPhong: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none bg-white"
                  >
                    <option value="">-- Chọn phòng/khoa --</option>
                    {phongKham.map(p => (
                      <option key={p.MaPhong} value={p.MaPhong}>{p.TenPhong}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ngày trực *</label>
                  <input
                    type="date"
                    value={dangKyForm.NgayTruc}
                    onChange={e => setDangKyForm({...dangKyForm, NgayTruc: e.target.value})}
                    min={todayKey()}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ca trực *</label>
                  <select
                    value={dangKyForm.CaTruc}
                    onChange={e => setDangKyForm({...dangKyForm, CaTruc: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none bg-white"
                    required
                  >
                    <option value="Sáng">Sáng (6h - 14h)</option>
                    <option value="Chiều">Chiều (14h - 22h)</option>
                    <option value="Đêm">Đêm (22h - 6h)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ghi chú</label>
                  <textarea
                    value={dangKyForm.GhiChu}
                    onChange={e => setDangKyForm({...dangKyForm, GhiChu: e.target.value})}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                    rows={2}
                    placeholder="Ghi chú thêm (nếu có)..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all"
                  >
                    Gửi đăng ký
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDangKyModal(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    <FaFileMedical className="text-white text-xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Tạo hồ sơ bệnh án mới</h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Chọn lịch khám để tạo hồ sơ bệnh án:</p>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lich
                    .filter(l => !hoSo.some(hs => hs.MaLich === l.MaLich))
                    .map((appointment) => (
                      <div
                        key={appointment.MaLich}
                        onClick={() => {
                          setSelectedLich(appointment.MaLich);
                          setShowCreateModal(false);
                          setActiveTab('records');
                        }}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800">
                              Lịch khám #{appointment.MaLich}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Bệnh nhân:</span> {appointment.TenBenhNhan}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Ngày khám:</span> {new Date(appointment.NgayKham).toLocaleString('vi-VN')}
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusBadge(appointment.TrangThai)}
                          </div>
                        </div>
                      </div>
                    ))}
                  
                  {lich.filter(l => !hoSo.some(hs => hs.MaLich === l.MaLich)).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FaFileMedical className="text-4xl mx-auto mb-2 opacity-50" />
                      <p>Tất cả lịch khám đã có hồ sơ bệnh án</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

