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
      <div className="relative bg-white/80 backdrop-blur-sm py-20 overflow-hidden border-b border-blue-100">
        <div className="container relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Chăm sóc bằng tài năng, y đức và sự thấu cảm
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              Hệ thống quản lý bệnh viện hiện đại, chuyên nghiệp và đáng tin cậy
            </p>
            
            {/* Quick Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <Link
                to="/dang-nhap"
                className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaPhone className="text-xl" />
                <span>Gọi tổng đài</span>
              </Link>
              <Link
                to={user && user.MaChucVu === 4 ? "/benh-nhan" : "/dang-ky"}
                className="flex items-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaCalendarCheck className="text-xl" />
                <span>Đặt Lịch Hẹn</span>
              </Link>
              <Link
                to={user && (user.MaChucVu === 1 || user.MaChucVu === 2) ? "/bac-si" : "/dang-nhap"}
                className="flex items-center gap-3 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FaSearch className="text-xl" />
                <span>Tìm bác sĩ</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-white py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Tại sao nên chọn chúng tôi?</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Chuyên gia hàng đầu */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaUserMd className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chuyên gia hàng đầu</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Quy tụ đội ngũ chuyên gia, bác sĩ có trình độ chuyên môn cao, tay nghề giỏi, tận tâm và chuyên nghiệp. Luôn đặt người bệnh làm trung tâm.
              </p>
            </div>

            {/* Chất lượng quốc tế */}
            <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaGlobe className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Chất lượng quốc tế</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Hệ thống được quản lý và vận hành dưới sự giám sát của những nhà quản lý giàu kinh nghiệm, cùng với phương tiện kỹ thuật hiện đại.
              </p>
            </div>

            {/* Công nghệ tiên tiến */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-purple-100">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaMicroscope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Công nghệ tiên tiến</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Cung cấp cơ sở vật chất hạng nhất và dịch vụ 5 sao bằng cách sử dụng các công nghệ tiên tiến được quản lý bởi các bác sĩ lâm sàng lành nghề.
              </p>
            </div>

            {/* Nghiên cứu & Đổi mới */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all border border-orange-100">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <FaLightbulb className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Nghiên cứu & Đổi mới</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Liên tục thúc đẩy y học hàn lâm dựa trên nghiên cứu có phương pháp và sự phát triển y tế được chia sẻ từ quan hệ đối tác toàn cầu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certifications and Awards */}
      <div className="bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Chứng nhận và giải thưởng</h2>
            <p className="text-gray-600 mb-8">Tự hào được các tổ chức uy tín trên thế giới công nhận</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { name: 'JCI', desc: 'Joint Commission International' },
              { name: 'CAP', desc: 'College of American Pathologists' },
              { name: 'ACC', desc: 'American College of Cardiology' },
              { name: 'AABB', desc: 'Association for Blood & Biotherapies' },
              { name: 'HMA', desc: 'Hospital Management Asia' },
              { name: 'RTAC', desc: 'Reproductive Technology Accreditation' }
            ].map((cert, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-100 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <FaCertificate className="text-blue-600 text-2xl" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{cert.name}</h4>
                <p className="text-xs text-gray-600">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Locations */}
      <div className="bg-white py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Hệ thống phòng khám và trung tâm</h2>
            <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
              Hệ thống Y tế hoạt động không vì mục tiêu lợi nhuận, có các bệnh viện đạt chứng chỉ tiêu chuẩn quốc tế về an toàn người bệnh và chất lượng bệnh viện.
            </p>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              'Bệnh viện Đa khoa Hà Nội',
              'Bệnh viện Đa khoa Thành phố Hồ Chí Minh',
              'Bệnh viện Đa khoa Đà Nẵng',
              'Bệnh viện Đa khoa Hải Phòng',
              'Bệnh viện Đa khoa Nha Trang',
              'Bệnh viện Đa khoa Cần Thơ'
            ].map((location, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FaBuilding className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{location}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-blue-600" />
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
      <div className="bg-gray-50 py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Đối tác của chúng tôi</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              'AstraZeneca',
              'GE Healthcare',
              'Cleveland Clinic',
              'Roche',
              'Osaka University',
              'University of Sydney'
            ].map((partner, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                    <FaShieldAlt className="text-gray-400 text-2xl" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">{partner}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Sẵn sàng bắt đầu?</h2>
          <p className="text-xl mb-8 opacity-90">Đăng ký ngay để trải nghiệm dịch vụ chăm sóc sức khỏe tốt nhất</p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/dang-ky"
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/dang-nhap"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
