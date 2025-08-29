import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import api from "../services/api";
import Layout from "../components/Layout";
import { cities } from "../constants";

// Google Maps API Key - Replace with your actual API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCTvXx2qxlKEHARt68erbxKviGoBq3F7Nk";

const IsletmeProfili = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("general");
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsPagination, setReviewsPagination] = useState({});
  const [map, setMap] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded");
        setMapLoaded(true);
      };
      script.onerror = () => {
        console.error("Failed to load Google Maps API");
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        setLoading(true);
        const data = await api.getUser(id);
        setBusiness(data);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("İşletme bilgileri yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBusiness();
    }
  }, [id]);

  // Initialize map when business data and Google Maps API are loaded
  useEffect(() => {
    if (
      mapLoaded &&
      business &&
      business.businessLatitude &&
      business.businessLongitude &&
      !map
    ) {
      const initializeMap = () => {
        const mapElement = document.getElementById("businessMap");
        if (!mapElement) {
          console.log("Map element not found, retrying...");
          // Retry after a short delay
          setTimeout(initializeMap, 100);
          return;
        }

        const businessLocation = {
          lat: business.businessLatitude,
          lng: business.businessLongitude,
        };

        try {
          console.log("Initializing map with location:", businessLocation);
          const mapInstance = new window.google.maps.Map(mapElement, {
            center: businessLocation,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          // Add marker for business location
          new window.google.maps.Marker({
            position: businessLocation,
            map: mapInstance,
            title:
              business.businessName ||
              `${business.firstName} ${business.lastName}`,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="#3B82F6" fill-opacity="0.2"/>
                  <circle cx="16" cy="16" r="8" fill="#3B82F6"/>
                  <circle cx="16" cy="16" r="4" fill="white"/>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16),
            },
          });

          console.log("Map initialized successfully");
          setMap(mapInstance);
        } catch (error) {
          console.error("Error initializing map:", error);
        }
      };

      // Start initialization
      initializeMap();
    }
  }, [mapLoaded, business, map]);

  // Reset map when switching to address tab
  useEffect(() => {
    if (
      activeTab === "address" &&
      mapLoaded &&
      business &&
      business.businessLatitude &&
      business.businessLongitude &&
      !map
    ) {
      // Small delay to ensure the DOM is ready
      const timer = setTimeout(() => {
        setMap(null); // Reset map state to trigger re-initialization
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [activeTab, mapLoaded, business, map]);

  // Cleanup map when component unmounts
  useEffect(() => {
    return () => {
      if (map) {
        // Clean up any event listeners or markers if needed
        setMap(null);
      }
    };
  }, [map]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id || !user) return;

      try {
        const [reviewsData, userReviewData] = await Promise.all([
          api.getBusinessReviews(id, reviewsPage, 10),
          api.getUserReview(id),
        ]);

        setReviews(reviewsData.reviews || []);
        setReviewsPagination(reviewsData.pagination || {});
        setUserReview(
          Object.keys(userReviewData).length > 0 ? userReviewData : null
        );
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [id, user, reviewsPage]);
  console.log("userReviewData", userReview);
  const handleCall = (phone) => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const handleMessage = () => {
    if (user) {
      navigate(`/mesajlar?userId=${id}`);
    } else {
      navigate("/giris-yap");
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      navigate("/giris-yap");
      return;
    }

    if (!reviewForm.comment.trim() || reviewForm.comment.length < 10) {
      alert("Yorum en az 10 karakter olmalıdır");
      return;
    }

    setIsSubmittingReview(true);
    try {
      if (userReview) {
        // Update existing review
        await api.updateReview(
          userReview._id,
          reviewForm.rating,
          reviewForm.comment
        );
      } else {
        // Create new review
        await api.createReview(id, reviewForm.rating, reviewForm.comment);
      }

      // Refresh reviews
      const [reviewsData, userReviewData] = await Promise.all([
        api.getBusinessReviews(id, reviewsPage, 10),
        api.getUserReview(id),
      ]);

      setReviews(reviewsData.reviews || []);
      setReviewsPagination(reviewsData.pagination || {});
      setUserReview(userReviewData);
      setShowReviewForm(false);
      setReviewForm({ rating: 5, comment: "" });

      // Refresh business data to update rating
      const updatedBusiness = await api.getUser(id);
      setBusiness(updatedBusiness);
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Değerlendirme gönderilirken hata oluştu");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;

    if (!confirm("Değerlendirmenizi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await api.deleteReview(userReview._id);

      // Refresh reviews
      const [reviewsData, userReviewData] = await Promise.all([
        api.getBusinessReviews(id, reviewsPage, 10),
        api.getUserReview(id),
      ]);

      setReviews(reviewsData.reviews || []);
      setReviewsPagination(reviewsData.pagination || {});
      setUserReview(userReviewData);

      // Refresh business data to update rating
      const updatedBusiness = await api.getUser(id);
      setBusiness(updatedBusiness);
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Değerlendirme silinirken hata oluştu");
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setReviewForm({
        rating: userReview.rating,
        comment: userReview.comment,
      });
    }
    setShowReviewForm(true);
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">İşletme bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
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
          <p className="text-gray-500 mb-4">{error || "İşletme bulunamadı"}</p>
          <button
            onClick={() => navigate("/")}
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>Ana Sayfaya Dön</span>
            </div>
          </button>
        </div>
      </div>
    );
  }
  console.log("reviews", reviews);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {business.photos && business.photos.length > 0 ? (
                  <img
                    src={`http://localhost:3001${business.photos[0]}`}
                    alt={
                      business.businessName ||
                      `${business.firstName} ${business.lastName}`
                    }
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                    {business.businessName
                      ? business.businessName.charAt(0)
                      : business.firstName?.charAt(0)}
                  </div>
                )}
              </div>
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                  business.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></div>
            </div>

            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {business.businessName ||
                    `${business.firstName} ${business.lastName}`}
                </h1>
                <span className="text-2xl">
                  {getSectorIcon(business.businessSector)}
                </span>
                {business.isVerified && (
                  <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Doğrulanmış
                  </div>
                )}
              </div>

              <p className="text-lg text-gray-600 mb-3">
                {business.businessSector
                  ? business.businessSector.charAt(0).toUpperCase() +
                    business.businessSector.slice(1)
                  : "Genel Hizmet"}
              </p>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    {cities.find((city) => city.value === business.city)?.label}
                  </span>
                </div>

                {business.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(business.rating)
                              ? "text-yellow-400"
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
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {business.phone && (
                  <button
                    onClick={() => handleCall(business.phone)}
                    className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
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
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <span>Ara</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={handleMessage}
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Mesaj Gönder</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("general")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "general"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Genel Bilgiler
                </div>
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "address"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Adres Bilgileri
                </div>
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === "reviews"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
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
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Değerlendirmeler ({business?.reviewCount || 0})
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "general" && (
              <div className="space-y-6">
                {/* Business Services */}
                {business.businessServices && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Hizmetler
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-gray-700 font-medium">
                        {business.businessServices}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    İletişim Bilgileri
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">E-posta</p>
                        <p className="font-medium">{business.email}</p>
                      </div>
                    </div>

                    {business.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <svg
                          className="w-5 h-5 text-gray-500"
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
                        <div>
                          <p className="text-sm text-gray-500">Telefon</p>
                          <p className="font-medium">{business.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Media */}
                {(business.instagram || business.facebook) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Sosyal Medya
                    </h3>
                    <div className="flex gap-4">
                      {business.instagram && (
                        <a
                          href={`https://instagram.com/${business.instagram.replace(
                            "@",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.2-4.354-.2-6.782-2.617-6.979-6.98-.059-1.281-.073-1.69-.073-4.949 0-3.259.014-3.668.072-4.948.2-4.358 2.617-6.78 6.979-6.98 1.281-.059 1.69-.073 4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                          <span>{business.instagram}</span>
                        </a>
                      )}

                      {business.facebook && (
                        <a
                          href={`https://facebook.com/${business.facebook.replace(
                            "facebook.com/",
                            ""
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                          <span>{business.facebook}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Ek Bilgiler
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                        <p className="font-medium">
                          {formatDate(business.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">Son Görülme</p>
                        <p className="font-medium">
                          {business.lastSeen
                            ? formatDate(business.lastSeen)
                            : "Bilinmiyor"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="space-y-6">
                {/* Business Address */}
                {business.businessAddress && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      İşletme Adresi
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg
                          className="w-6 h-6 text-gray-500 mt-1"
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
                        <div>
                          <p className="text-gray-700 font-medium">
                            {business.businessAddress}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {business.city}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* City Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Şehir Bilgileri
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-6 h-6 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <div>
                        <p className="text-gray-700 font-medium">
                          Hizmet Bölgesi
                        </p>
                        <p className="text-sm text-gray-500">{business.city}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Maps Display */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Konum
                  </h3>

                  {business.businessLatitude && business.businessLongitude ? (
                    <div className="space-y-3">
                      {/* Map Container */}
                      <div className="relative">
                        <div
                          id="businessMap"
                          className="w-full h-64 rounded-lg border border-gray-200 shadow-sm"
                        ></div>

                        {/* Map Loading Overlay */}
                        {!map && (
                          <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                              <p className="text-sm text-gray-600">
                                {mapLoaded
                                  ? "Harita yükleniyor..."
                                  : "Google Maps yükleniyor..."}
                              </p>
                              {!mapLoaded && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Lütfen bekleyin...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Coordinates Display */}
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">
                          Konum Koordinatları:
                        </p>
                        <p className="text-xs text-blue-600">
                          Enlem: {business.businessLatitude.toFixed(6)}, Boylam:{" "}
                          {business.businessLongitude.toFixed(6)}
                        </p>
                      </div>

                      {/* Map Instructions */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600">
                          💡 Haritada işaretçi ile gösterilen konum işletmenizin
                          bulunduğu yerdir
                        </p>
                      </div>

                      {/* Go to Location Button */}
                      <div className="text-center">
                        <a
                          href={`https://www.google.com/maps?q=${business.businessLatitude},${business.businessLongitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium"
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
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          <span>Konuma Git</span>
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <svg
                          className="w-16 h-16 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                          />
                        </svg>
                        <p>Konum bilgisi bulunamadı</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Review Form */}
                {user && user.userType === "musteri" && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {userReview
                        ? "Değerlendirmenizi Düzenleyin"
                        : "Değerlendirme Yapın"}
                    </h3>

                    {!showReviewForm && !userReview && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-medium"
                      >
                        Değerlendirme Yap
                      </button>
                    )}

                    {!showReviewForm && userReview && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${
                                  i < userReview.rating
                                    ? "text-yellow-400"
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
                            {userReview.rating}/5
                          </span>
                        </div>
                        <p className="text-gray-700">{userReview.comment}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={handleEditReview}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={handleDeleteReview}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    )}

                    {showReviewForm && (
                      <div className="space-y-4">
                        {/* Rating */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Puanınız
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() =>
                                  setReviewForm({ ...reviewForm, rating: star })
                                }
                                className="focus:outline-none"
                              >
                                <svg
                                  className={`w-8 h-8 ${
                                    star <= reviewForm.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Comment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yorumunuz
                          </label>
                          <textarea
                            value={reviewForm.comment}
                            onChange={(e) =>
                              setReviewForm({
                                ...reviewForm,
                                comment: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                            placeholder="Deneyiminizi paylaşın (en az 10 karakter)"
                            maxLength={500}
                          />
                          <div className="text-sm text-gray-500 mt-1">
                            {reviewForm.comment.length}/500 karakter
                          </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                          <button
                            onClick={handleSubmitReview}
                            disabled={
                              isSubmittingReview ||
                              reviewForm.comment.length < 10
                            }
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmittingReview ? "Gönderiliyor..." : "Gönder"}
                          </button>
                          <button
                            onClick={() => {
                              setShowReviewForm(false);
                              setReviewForm({ rating: 5, comment: "" });
                            }}
                            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews List */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Müşteri Değerlendirmeleri
                  </h3>

                  {reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="w-16 h-16 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                      <p>
                        {!user
                          ? "Değerlinderme yapmak için veya değerlendirmeleri görmek için giriş yapınız"
                          : "Henüz değerlendirme yapılmamış"}
                      </p>
                      {!user && (
                        <button
                          onClick={() => navigate("/giris-yap")}
                          className="mt-4 px-6 py-2 bg-gradient-to-r rounded-lg  transition-all duration-300 font-medium border border-gray-300 hover:bg-gray-100"
                        >
                          Giriş Yap
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            {/* Reviewer Avatar */}
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                              {review?.reviewerId?.photos &&
                              review.reviewerId.photos.length > 0 ? (
                                <img
                                  src={`http://localhost:3001${review.reviewerId.photos[0]}`}
                                  alt={`${review.reviewerId.firstName} ${review.reviewerId.lastName}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                                  {review.reviewerId.firstName?.charAt(0)}
                                </div>
                              )}
                            </div>

                            {/* Review Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {review.reviewerId.firstName}{" "}
                                  {review.reviewerId.lastName}
                                </h4>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`w-4 h-4 ${
                                        i < review.rating
                                          ? "text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {formatDate(review.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pagination */}
                      {reviewsPagination.pages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                          <button
                            onClick={() =>
                              setReviewsPage(Math.max(1, reviewsPage - 1))
                            }
                            disabled={reviewsPage === 1}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Önceki
                          </button>
                          <span className="px-3 py-2 text-gray-700">
                            Sayfa {reviewsPage} / {reviewsPagination.pages}
                          </span>
                          <button
                            onClick={() =>
                              setReviewsPage(
                                Math.min(
                                  reviewsPagination.pages,
                                  reviewsPage + 1
                                )
                              )
                            }
                            disabled={reviewsPage === reviewsPagination.pages}
                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Sonraki
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IsletmeProfili;
