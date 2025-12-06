import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FaHospital, FaUserMd, FaCalendarCheck, FaPhone, FaSearch,
  FaAward, FaGlobe, FaFlask, FaMicroscope,
  FaCertificate, FaTrophy, FaShieldAlt,
  FaMapMarkerAlt, FaBuilding, FaLightbulb
} from 'react-icons/fa';

export default function Home() {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="min-h-screen relative">
      {/* Hero Section */}
      <div className="relative py-32 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
      }}>
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
        
        <div className="container relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="mb-8 inline-block">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform">
                <FaHospital className="text-white text-5xl" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-2xl">
              Chăm sóc bằng tài năng, y đức và sự thấu cảm
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 font-medium drop-shadow-lg">
              Hệ thống quản lý bệnh viện hiện đại, chuyên nghiệp và đáng tin cậy
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/dang-nhap"
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                <FaPhone className="text-xl" />
                <span>Gọi tổng đài</span>
              </Link>
              <Link
                to={user && user.MaChucVu === 4 ? "/benh-nhan" : "/dang-ky"}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-semibold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                <FaCalendarCheck className="text-xl" />
                <span>Đặt Lịch Hẹn</span>
              </Link>
              <Link
                to={user && (user.MaChucVu === 1 || user.MaChucVu === 2) ? "/bac-si" : "/dang-nhap"}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 backdrop-blur-sm border border-white/30"
              >
                <FaSearch className="text-xl" />
                <span>Tìm bác sĩ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #f8fafc 50%, #f1f5f9 75%, #f0f9ff 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
      }}>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Tại sao nên chọn chúng tôi?
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Chuyên gia hàng đầu */}
            <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all border border-blue-200/50 transform hover:-translate-y-2 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  <FaUserMd className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chuyên gia hàng đầu</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Quy tụ đội ngũ chuyên gia, bác sĩ có trình độ chuyên môn cao, tay nghề giỏi, tận tâm và chuyên nghiệp. Luôn đặt người bệnh làm trung tâm.
                </p>
              </div>
            </div>

            {/* Chất lượng quốc tế */}
            <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all border border-green-200/50 transform hover:-translate-y-2 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  <FaGlobe className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chất lượng quốc tế</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Hệ thống được quản lý và vận hành dưới sự giám sát của những nhà quản lý giàu kinh nghiệm, cùng với phương tiện kỹ thuật hiện đại.
                </p>
              </div>
            </div>

            {/* Công nghệ tiên tiến */}
            <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all border border-purple-200/50 transform hover:-translate-y-2 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  <FaMicroscope className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Công nghệ tiên tiến</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Cung cấp cơ sở vật chất hạng nhất và dịch vụ 5 sao bằng cách sử dụng các công nghệ tiên tiến được quản lý bởi các bác sĩ lâm sàng lành nghề.
                </p>
              </div>
            </div>

            {/* Nghiên cứu & Đổi mới */}
            <div className="relative bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl hover:shadow-3xl transition-all border border-orange-200/50 transform hover:-translate-y-2 group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl group-hover:scale-110 transition-transform">
                  <FaLightbulb className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Nghiên cứu & Đổi mới</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Liên tục thúc đẩy y học hàn lâm dựa trên nghiên cứu có phương pháp và sự phát triển y tế được chia sẻ từ quan hệ đối tác toàn cầu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications and Awards */}
      <div className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
        }}></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Chứng nhận và giải thưởng
            </h2>
            <p className="text-xl text-gray-700 mb-8 font-medium">Tự hào được các tổ chức uy tín trên thế giới công nhận</p>
            <div className="w-32 h-1.5 bg-gradient-to-r from-indigo-600 to-pink-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'JCI', desc: 'Joint Commission International', gradient: 'from-blue-500 to-cyan-500' },
              { name: 'CAP', desc: 'College of American Pathologists', gradient: 'from-green-500 to-emerald-500' },
              { name: 'ACC', desc: 'American College of Cardiology', gradient: 'from-red-500 to-rose-500' },
              { name: 'AABB', desc: 'Association for Blood & Biotherapies', gradient: 'from-purple-500 to-pink-500' },
              { name: 'HMA', desc: 'Hospital Management Asia', gradient: 'from-orange-500 to-amber-500' },
              { name: 'RTAC', desc: 'Reproductive Technology Accreditation', gradient: 'from-indigo-500 to-violet-500' }
            ].map((cert, idx) => (
              <div key={idx} className="relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/50 text-center transform hover:-translate-y-2 group overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${cert.gradient} opacity-10 rounded-full -mr-12 -mt-12 group-hover:opacity-20 transition-opacity`}></div>
                <div className={`relative z-10 w-20 h-20 bg-gradient-to-br ${cert.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                  <FaCertificate className="text-white text-3xl" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2 text-lg">{cert.name}</h4>
                <p className="text-xs text-gray-600 leading-tight">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Locations */}
      <div className="relative py-24 overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2306b6d4' fill-opacity='0.05'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20z'/%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Hệ thống phòng khám và trung tâm
            </h2>
            <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto font-medium">
              Hệ thống Y tế hoạt động không vì mục tiêu lợi nhuận, có các bệnh viện đạt chứng chỉ tiêu chuẩn quốc tế về an toàn người bệnh và chất lượng bệnh viện.
            </p>
            <div className="w-32 h-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Bệnh viện Đa khoa Hà Nội', gradient: 'from-blue-500 to-cyan-500' },
              { name: 'Bệnh viện Đa khoa Thành phố Hồ Chí Minh', gradient: 'from-emerald-500 to-teal-500' },
              { name: 'Bệnh viện Đa khoa Đà Nẵng', gradient: 'from-purple-500 to-pink-500' },
              { name: 'Bệnh viện Đa khoa Hải Phòng', gradient: 'from-orange-500 to-amber-500' },
              { name: 'Bệnh viện Đa khoa Nha Trang', gradient: 'from-red-500 to-rose-500' },
              { name: 'Bệnh viện Đa khoa Cần Thơ', gradient: 'from-indigo-500 to-violet-500' }
            ].map((location, idx) => (
              <div key={idx} className="relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/50 transform hover:-translate-y-2 group overflow-hidden">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${location.gradient} opacity-10 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`}></div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${location.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                    <FaBuilding className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{location.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className={`text-transparent bg-gradient-to-r ${location.gradient} bg-clip-text`} />
                      <span>Việt Nam</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2364758b' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-600 via-gray-600 to-zinc-600 bg-clip-text text-transparent mb-6">
              Đối tác của chúng tôi
            </h2>
            <div className="w-32 h-1.5 bg-gradient-to-r from-slate-600 to-zinc-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'AstraZeneca', gradient: 'from-blue-500 to-indigo-500' },
              { name: 'GE Healthcare', gradient: 'from-green-500 to-emerald-500' },
              { name: 'Cleveland Clinic', gradient: 'from-purple-500 to-pink-500' },
              { name: 'Roche', gradient: 'from-red-500 to-rose-500' },
              { name: 'Osaka University', gradient: 'from-orange-500 to-amber-500' },
              { name: 'University of Sydney', gradient: 'from-cyan-500 to-teal-500' }
            ].map((partner, idx) => (
              <div key={idx} className="relative bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/50 flex items-center justify-center transform hover:-translate-y-2 group overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${partner.gradient} opacity-10 rounded-full -mr-12 -mt-12 group-hover:opacity-20 transition-opacity`}></div>
                <div className="text-center relative z-10">
                  <div className={`w-20 h-20 bg-gradient-to-br ${partner.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                    <FaShieldAlt className="text-white text-2xl" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{partner.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 overflow-hidden" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 20s ease infinite'
      }}>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        <div className="container text-center relative z-10">
          <div className="mb-8 inline-block">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <FaTrophy className="text-white text-4xl" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-2xl">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl md:text-2xl mb-10 text-white/95 font-medium drop-shadow-lg">Đăng ký ngay để trải nghiệm dịch vụ chăm sóc sức khỏe tốt nhất</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/dang-ky"
              className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-2 hover:scale-105 backdrop-blur-sm border border-white/30"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/dang-nhap"
              className="px-10 py-5 bg-white/10 backdrop-blur-md border-2 border-white/50 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
