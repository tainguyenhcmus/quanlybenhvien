import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TableDanhSach from '../components/TableDanhSach';
import MedicalRecord from '../components/MedicalRecord';
import { FaUserMd, FaCalendarAlt, FaUsers, FaClock, FaFileMedical } from 'react-icons/fa';

export default function BacSi(){
  const [lich, setLich] = useState([]);
  const [hoSo, setHoSo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLich, setSelectedLich] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lichRes, hoSoRes] = await Promise.all([
        api.get('/lichkham'),
        api.get('/hosobenhan')
      ]);
      setLich(lichRes.data);
      setHoSo(hoSoRes.data);
    } catch(e){
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> { loadData(); },[]);

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

