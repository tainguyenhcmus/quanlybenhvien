import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import FormDatLich from '../components/FormDatLich';
import TableDanhSach from '../components/TableDanhSach';
import MedicalRecord from '../components/MedicalRecord';
import { FaCalendarCheck, FaHistory, FaFileMedical } from 'react-icons/fa';

export default function BenhNhan(){
  const { user } = useContext(AuthContext);
  const [lich, setLich] = useState([]);
  const [hoSo, setHoSo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLich, setSelectedLich] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');

  const load = async ()=> {
    try {
      setLoading(true);
      const me = await api.get('/benhnhan/me');
      const maBN = me.data.MaBenhNhan;
      const [lichRes, hoSoRes] = await Promise.all([
        api.get(`/lichkham/benh-nhan/${maBN}`),
        api.get(`/hosobenhan/benh-nhan/${maBN}`)
      ]);
      setLich(lichRes.data);
      setHoSo(hoSoRes.data);
    } catch(e){
      console.error('Error loading data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ load(); },[]);

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
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FaCalendarCheck className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển bệnh nhân</h1>
              <p className="text-gray-600">Quản lý lịch khám và hồ sơ bệnh án</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Tổng lịch khám</p>
            <p className="text-3xl font-bold text-gray-800">{lich.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Hồ sơ bệnh án</p>
            <p className="text-3xl font-bold text-gray-800">{hoSo.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-medium mb-1">Đã hoàn thành</p>
            <p className="text-3xl font-bold text-gray-800">
              {lich.filter(l => l.TrangThai === 'Hoàn thành').length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            <button
              onClick={() => { setActiveTab('appointments'); setSelectedLich(null); }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'appointments'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50'
              }`}
            >
              <FaCalendarCheck />
              <span>Lịch khám</span>
            </button>
            <button
              onClick={() => { setActiveTab('records'); setSelectedLich(null); }}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-2 ${
                activeTab === 'records'
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-gray-50'
              }`}
            >
              <FaFileMedical />
              <span>Hồ sơ bệnh án</span>
            </button>
          </div>
        </div>

        {activeTab === 'appointments' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch khám của tôi</h2>
                {loading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 text-green-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      { key:'TenBacSi', title:'Bác sĩ', render: r => <span className="font-medium">{r.TenBacSi}</span> },
                      { key:'TrangThai', title:'Trạng thái', render: r => getStatusBadge(r.TrangThai) }
                    ]}
                    data={lich}
                    actions={(row) => (
                      <button
                        onClick={() => {
                          setSelectedLich(row.MaLich);
                          setActiveTab('records');
                        }}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        Xem hồ sơ
                      </button>
                    )}
                  />
                )}
              </div>
            </div>
            <div>
              <FormDatLich onSuccess={load} />
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-6">
            {selectedLich ? (
              <MedicalRecord 
                maLich={selectedLich} 
                maBenhNhan={lich.find(l => l.MaLich === selectedLich)?.MaBenhNhan}
                canEdit={false}
                onUpdate={load}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Danh sách hồ sơ bệnh án</h3>
                {loading ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-8 w-8 text-green-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                        </div>
                        {hs.ChanDoan && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            <strong>Chẩn đoán:</strong> {hs.ChanDoan}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {selectedLich && (
              <button
                onClick={() => setSelectedLich(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-all"
              >
                ← Quay lại danh sách
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

