import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";

const Layout = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };
  // Fetch complete user details when profile page loads
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.id) {
        const apiService = (await import("../services/api")).default;
        await apiService.getUserDetails();
      }
    };

    fetchUserDetails();
  }, [user]); // Only run once when component mounts

  return (
    <div className="flex flex-col h-screen bg-gray-50 custom-scrollbar">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Left side - Anasayfa */}
          <div className="flex items-center space-x-2">
            <Link to="/">
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
            </Link>
          </div>
          <div className="flex items-center">
            <Link
              to="/cekici-hizmetleri"
              className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg group"
            >
              Yol Yardımı
            </Link>
            {/* Center - Messages (only show if logged in) */}
          </div>

          {/* Right side - Auth buttons or User menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              // User is logged in - show profile and logout
              <>
                <Link
                  to="/profilim"
                  className="inline-flex items-center px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 hover:bg-blue-50 rounded-lg group"
                >
                  <svg
                    className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
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
                  to="/giris-yap"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 hover:bg-gray-100 rounded-lg"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/kayit-ol"
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
