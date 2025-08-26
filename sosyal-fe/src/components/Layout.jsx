import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Anasayfa */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            <Link to="/">
              <span className="text-xl font-bold text-gray-900">Anasayfa</span>
            </Link>
          </div>

          {/* Center - Messages (only show if logged in) */}
          {user && (
            <div className="flex items-center">
              <Link
                to="/messages"
                className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg group"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Mesajlar
              </Link>
            </div>
          )}

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              // User is logged in - show profile and logout
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg group"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {user.firstName} {user.lastName}
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium transition-colors duration-200 hover:bg-red-50 rounded-lg border border-red-200 hover:border-red-300"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              // User is not logged in - show login and register
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-lg"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                                     className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Kayıt Ol
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Static App Information */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex-shrink-0 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* App Header */}
                         <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold">Ustamsağlam</h1>
                  <p className="text-blue-100 text-sm">Otomotiv Hizmet Platformu</p>
                </div>
              </div>
            </div>

            {/* App Information Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* About Section */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Ustamsağlam Hakkında
                </h3>
                <p className="text-blue-800 text-sm leading-relaxed">
                  Ustamsağlam'da arabanızı tamir ettirebileceğiniz işletmelere ulaşabilceksiniz.
                  Türkiye'nin en güvenilir ve profesyonel otomotiv hizmet platformu.
                  Kaliteli hizmet veren işletmeleri keşfedin ve güvenle iletişime geçin.
                </p>
              </div>

              {/* Features Section */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Özellikler
                </h3>
                <ul className="text-green-800 text-sm space-y-2">
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Gelişmiş Filtreleme
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Güvenli İletişim
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Profesyonel Profiller
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Anlık Bildirimler
                  </li>
                </ul>
              </div>

              {/* Statistics Section */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  Ustamsağlam İstatistikleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      8,000+
                    </div>
                    <div className="text-xs text-purple-700">Kayıtlı İşletme</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      67
                    </div>
                    <div className="text-xs text-purple-700">Şehir</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      25,000+
                    </div>
                    <div className="text-xs text-purple-700">Kayıtlı Müşteri</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      96%
                    </div>
                    <div className="text-xs text-purple-700">Memnuniyet</div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  İletişim Bilgileri
                </h3>
                <div className="text-orange-800 text-sm space-y-2">
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    +90 (212) 555-0123
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    info@ustamsaglam.com
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    İstanbul, Türkiye
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-gray-500 text-xs pt-4 border-t border-gray-200">
                <p>© 2024 Ustamsağlam</p>
                <p className="mt-1">Tüm hakları saklıdır</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Area - Scrollable */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto custom-scrollbar">
            <Outlet />
          </div>
        </div>

        {/* Custom Scrollbar Styles */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }

          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 4px;
          }

                     .custom-scrollbar::-webkit-scrollbar-thumb {
             background: #3b82f6;
             border-radius: 4px;
             transition: all 0.3s ease;
           }

           .custom-scrollbar::-webkit-scrollbar-thumb:hover {
             background: #2563eb;
             transform: scale(1.1);
           }

          .custom-scrollbar::-webkit-scrollbar-corner {
            background: #f1f5f9;
          }

          /* Firefox scrollbar */
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #3b82f6 #f1f5f9;
          }
        `}</style>
      </div>
    </div>
  );
};

export default Layout;
