import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  console.log(user);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [cities] = useState([
    { label: "İzmir", value: "izmir" },
    { label: "Adana", value: "adana" },
    { label: "Denizli", value: "denizli" },
  ]);
  const [sectors] = useState([
    { label: "Elektrik", value: "elektrik" },
    { label: "Kaporta", value: "kaporta" },
    { label: "Boyama", value: "boyama" },
    { label: "Çekici", value: "cekici" },
    { label: "Ekspertiz", value: "ekspertiz" },
  ]);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Load businesses from backend
  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Import API service dynamically
        const apiService = (await import("../services/api")).default;

        // Get service providers (businesses)
        const serviceProviders = await apiService.getServiceProviders(
          selectedCity,
          selectedSector
        );

        if (serviceProviders && serviceProviders.length > 0) {
          // Transform backend data to match frontend format
          const transformedBusinesses = serviceProviders.map((business) => ({
            id: business._id,
            name:
              business.businessName ||
              `${business.firstName} ${business.lastName}`,
            ownerName: `${business.firstName} ${business.lastName}`,
            city: business.city || "Belirtilmemiş",
            sector: business.businessSector || "Genel",
            services:
              business.businessServices || "Hizmet açıklaması bulunmuyor",
            address: business.businessAddress || "Adres belirtilmemiş",
            rating: business.rating || 0,
            reviewCount: business.reviewCount || 0,
            isOnline: business.isOnline || false,
            isVerified: business.isVerified || false,
            instagram: business.instagram || "",
            facebook: business.facebook || "",
            phone: business.phone || "",
            photos:
              business.photos && business.photos.length > 0
                ? business.photos.map(
                    (photo) => `http://localhost:3001${photo}`
                  )
                : [
                    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
                  ],
            createdAt: business.createdAt,
            lastSeen: business.lastSeen,
          }));

          setBusinesses(transformedBusinesses);
        } else {
          setBusinesses([]);
        }
      } catch (error) {
        console.error("Failed to load businesses:", error);
        setError("İşletmeler yüklenemedi");
        setBusinesses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinesses();
  }, [selectedCity, selectedSector]);

  // Filter businesses based on selected criteria
  const filteredBusinesses = businesses.filter((business) => {
    if (selectedCity && business.city !== selectedCity) return false;
    if (selectedSector && business.sector !== selectedSector) return false;
    return true;
  });

  const nextImage = (businessId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [businessId]:
        ((prev[businessId] || 0) + 1) %
        (businesses.find((b) => b.id === businessId)?.photos.length || 1),
    }));
  };

  const prevImage = (businessId) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [businessId]:
        prev[businessId] === 0
          ? (businesses.find((b) => b.id === businessId)?.photos.length || 1) -
            1
          : (prev[businessId] || 0) - 1,
    }));
  };

  const clearFilters = () => {
    setSelectedCity("");
    setSelectedSector("");
  };

  const handleSendMessage = (business) => {
    navigate("/mesajlar", {
      state: {
        targetUser: {
          id: business.id,
          name: business.name,
          avatar:
            business.photos && business.photos.length > 0
              ? business.photos[0]?.split("http://localhost:3001")[1]
              : null,
        },
      },
    });
  };

  const handleCallBusiness = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const handleViewProfile = (business) => {
    if (business.id === user?.id) {
      navigate("/profilim");
    } else {
      navigate(`/isletme/${business.id}`);
    }
    // Navigate to business profile page (you can implement this later)
    console.log("View profile for:", business.name);
    // TODO: Implement navigation to business profile page
    // navigate(`/business/${business.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getSectorIcon = (sector) => {
    const sectorIcons = {
      cekici: "🚛",
      elektrik: "⚡",
      kaporta: "🔧",
      boya: "🎨",
      motor: "🏍️",
      lastik: "🛞️",
      akü: "🔋",
      fren: "🛑",
      suspansiyon: "🔄",
      genel: "🔧",
    };
    return sectorIcons[sector?.toLowerCase()] || "🔧";
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Tekrar Dene</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header 
      <div className="bg-white shadow-lg border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              🔧 Tamir Dükkanları
            </h1>
            <p className="text-xl text-gray-600">
              Güvenilir işletmeleri keşfedin ve hizmet alın
            </p>
          </div>
        </div>
      </div>
*/}
      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Filtreler</h2>
            <button
              onClick={clearFilters}
              className="group relative overflow-hidden px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:text-gray-800 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md border border-gray-200"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Filtreleri Temizle</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🏙️ Şehir Seçin
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sector Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                🏭 Sektör Seçin
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Tüm Sektörler</option>
                {sectors.map((sector) => (
                  <option key={sector.value} value={sector.value}>
                    {sector.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredBusinesses.length} İşletme Bulundu
            </h2>
            <p className="text-gray-600">
              {selectedCity &&
                `📍 ${
                  cities.find((city) => city.value === selectedCity)?.label
                }`}
              {selectedSector && `• 🏭 ${selectedSector}`}
            </p>
          </div>
          {isLoading && (
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-md">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm text-gray-600 font-medium">
                Yükleniyor...
              </span>
            </div>
          )}
        </div>

        {/* Businesses Grid */}
        {filteredBusinesses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-3">
              İşletme Bulunamadı
            </h3>
            <p className="text-gray-500 mb-6">
              Seçtiğiniz kriterlere uygun işletme bulunamadı. Filtreleri
              değiştirmeyi deneyin.
            </p>
            <button
              onClick={clearFilters}
              className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                <span>Tüm Filtreleri Temizle</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBusinesses.map((business) => (
              <div
                key={business.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Image Gallery */}
                <div className="relative h-64 bg-gray-100">
                  {business.photos && business.photos.length > 0 ? (
                    <>
                      <img
                        src={
                          business.photos[currentImageIndex[business.id] || 0]
                        }
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                      {business.photos.length > 1 && (
                        <>
                          <button
                            onClick={() => prevImage(business.id)}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 19l-7-7 7-7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => nextImage(business.id)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80 transition-all duration-200"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                            {business.photos.map((_, index) => (
                              <div
                                key={index}
                                className={`w-3 h-3 rounded-full ${
                                  index ===
                                  (currentImageIndex[business.id] || 0)
                                    ? "bg-white"
                                    : "bg-white bg-opacity-50"
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <div className="text-center">
                        <div className="text-6xl mb-2">
                          {getSectorIcon(business.sector)}
                        </div>
                        <p className="text-gray-500 font-medium">
                          Fotoğraf Yok
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Online Status Badge */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        business.isOnline
                          ? "bg-green-500 text-white"
                          : "bg-gray-500 text-white"
                      }`}
                    >
                      {business.isOnline ? "🟢 Çevrimiçi" : "⚫ Çevrimdışı"}
                    </div>
                  </div>

                  {/* Verified Badge */}
                  {business.isVerified && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ✓ Doğrulanmış
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {getSectorIcon(business.sector)}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {business.name}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        📍{" "}
                        {
                          cities.find((city) => city.value === business.city)
                            ?.label
                        }
                      </p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(business.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {business.rating.toFixed(1)} ({business.reviewCount}{" "}
                      değerlendirme)
                    </span>
                  </div>

                  {/* Services Description */}
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {business.services}
                  </p>

                  {/* Business Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    {business.address &&
                      business.address !== "Adres belirtilmemiş" && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-500">📍</span>
                          <span className="text-gray-700">
                            {business.address}
                          </span>
                        </div>
                      )}
                    {business.phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📞</span>
                        <span className="text-gray-700">{business.phone}</span>
                      </div>
                    )}
                    {business.instagram && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📷</span>
                        <span className="text-gray-700">
                          {business.instagram}
                        </span>
                      </div>
                    )}
                    {business.facebook && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">📘</span>
                        <span className="text-gray-700">
                          {business.facebook}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Message Button */}
                    {business?.id !== user?.id && (
                      <button
                        onClick={() => handleSendMessage(business)}
                        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium text-sm"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                            />
                          </svg>
                          <span>Mesaj</span>
                        </div>
                      </button>
                    )}
                    {/* View Profile Button */}
                    <button
                      onClick={() => handleViewProfile(business)}
                      className="w-full bg-white text-gray-700 py-2.5 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200 font-medium text-sm"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        <span>Profili Gör</span>
                      </div>
                    </button>
                  </div>
                  {/* Additional Info
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Kayıt: {formatDate(business.createdAt)}</span>
                      {business.lastSeen && (
                        <span>
                          Son görülme: {formatDate(business.lastSeen)}
                        </span>
                      )}
                    </div>
                  </div>
                   */}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
