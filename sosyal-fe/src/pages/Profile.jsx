import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    birthDate: "",
    height: "",
    weight: "",
    age: "",
    skinColor: "",
    preferences: "",
    services: "",
    priceRange: "",
  });

  const skinColorOptions = [
    { label: "Sarışın", value: "sarışın" },
    { label: "Kumral", value: "kumral" },
    { label: "Esmersi", value: "esmersi" },
    { label: "Siyah", value: "siyah" },
    { label: "Açık Ten", value: "açık ten" },
    { label: "Orta Ten", value: "orta ten" },
    { label: "Koyu Ten", value: "koyu ten" },
  ];

  const cities = [
    "İstanbul",
    "Ankara",
    "İzmir",
    "Bursa",
    "Antalya",
    "Adana",
    "Konya",
    "Gaziantep",
    "Mersin",
    "Diyarbakır",
    "Samsun",
    "Denizli",
    "Eskişehir",
    "Trabzon",
    "Erzurum",
  ];

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        city: user.city || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        height: user.height || "",
        weight: user.weight || "",
        age: user.age || "",
        skinColor: user.skinColor || "",
        preferences: user.preferences || "",
        services: user.services || "",
        priceRange: user.priceRange || "",
      });
    }
  }, [user]);

  // Fetch complete user details when profile page loads
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user && user.id) {
        try {
          setLoading(true);
          setError(null);

          const apiService = (await import("../services/api")).default;
          const userDetails = await apiService.getUserDetails();


          // Update user data with complete information
          updateUser(userDetails);
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          setError(
            "Kullanıcı bilgileri yüklenemedi: " +
              (error.message || "Bilinmeyen hata")
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, []); // Only run once when component mounts

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Prepare update data
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        city: formData.city,
        birthDate: formData.birthDate,
        height: parseInt(formData.height),
        weight: parseInt(formData.weight),
        age: parseInt(formData.age),
        skinColor: formData.skinColor,
        ...(user.userType === "musteri" && {
          preferences: formData.preferences,
        }),
        ...(user.userType === "isletme" && {
          services: formData.services,
          priceRange: formData.priceRange,
        }),
      };

      // Import API service dynamically
      const apiService = (await import("../services/api")).default;
      await apiService.updateUser(user.id, updateData);

      // Update local user data
      updateUser({
        ...user,
        ...updateData,
      });

      setIsEditing(false);
      setSuccessMessage("Profil başarıyla güncellendi!");
      setError(null);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Profil güncellenirken bir hata oluştu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        city: user.city || "",
        birthDate: user.birthDate
          ? new Date(user.birthDate).toISOString().split("T")[0]
          : "",
        height: user.height || "",
        weight: user.weight || "",
        age: user.age || "",
        skinColor: user.skinColor || "",
        preferences: user.preferences || "",
        services: user.services || "",
        priceRange: user.priceRange || "",
      });
    }
    setIsEditing(false);
    setError(null);
    setSuccessMessage(null);
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Sadece JPG, PNG ve GIF dosyaları kabul edilir");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan küçük olmalıdır");
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      const apiService = (await import("../services/api")).default;
      const result = await apiService.uploadPhoto(file);

      // Update local user data with new photo
      updateUser({
        ...user,
        photos: [...(user.photos || []), result.photoUrl],
      });

      setSuccessMessage("Fotoğraf başarıyla yüklendi!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Photo upload failed:", error);
      setError(
        "Fotoğraf yüklenirken bir hata oluştu: " +
          (error.message || "Bilinmeyen hata")
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoRemove = async (photoUrl) => {
    if (!confirm("Bu fotoğrafı kaldırmak istediğinizden emin misiniz?")) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      const apiService = (await import("../services/api")).default;
      await apiService.removePhoto(photoUrl);

      // Update local user data by removing the photo
      updateUser({
        ...user,
        photos: user.photos.filter((photo) => photo !== photoUrl),
      });

      setSuccessMessage("Fotoğraf başarıyla kaldırıldı!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (error) {
      console.error("Photo removal failed:", error);
      setError(
        "Fotoğraf kaldırılırken bir hata oluştu: " +
          (error.message || "Bilinmeyen hata")
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Giriş Yapılmamış
          </h3>
          <p className="text-gray-500">
            Profil sayfasını görüntülemek için giriş yapmalısınız.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while fetching user details
  if (loading && !user.photos && !user.preferences) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-500 animate-spin"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Profil Yükleniyor
          </h3>
          <p className="text-gray-500">Kullanıcı bilgileri getiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
            <p className="text-gray-600">
              Hesap bilgilerinizi görüntüleyin ve düzenleyin
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              const fetchUserDetails = async () => {
                try {
                  const apiService = (await import("../services/api")).default;
                  const userDetails = await apiService.getUserDetails();
                  updateUser(userDetails);
                  setError(null);
                } catch (error) {
                  console.error("Failed to refresh user details:", error);
                  setError(
                    "Profil yenilenemedi: " +
                      (error.message || "Bilinmeyen hata")
                  );
                } finally {
                  setLoading(false);
                }
              };
              fetchUserDetails();
            }}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
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
            {loading ? "Yenileniyor..." : "Yenile"}
          </button>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center space-x-4">
              {/* Profile Photo */}
              <div className="relative">
                {user.photos && user.photos.length > 0 ? (
                  <img
                    src={`http://localhost:3001${user.photos[0]}`}
                    alt="Profil Fotoğrafı"
                    className="w-20 h-20 rounded-full object-cover border-4 border-white/20"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-10 h-10"
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
                )}
                {/* Online Status Indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                    user.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                ></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">
                    {user.firstName} {user.lastName}
                  </h2>
                  {user.isVerified && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-100">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Doğrulanmış
                    </div>
                  )}
                </div>
                <p className="text-blue-100">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                    {user.userType === "musteri" ? "Müşteri" : "İlan Veren"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                    {user.city}
                  </span>
                  {user.rating > 0 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-100">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {user.rating.toFixed(1)} ({user.reviewCount}{" "}
                      değerlendirme)
                    </span>
                  )}
                </div>

                {/* Physical Attributes Display - Only for Service Providers */}
                {user.userType === "isletme" &&
                  (user.height ||
                    user.weight ||
                    user.age ||
                    user.skinColor) && (
                    <div className="flex items-center space-x-4 mt-3">
                      {user.height && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                          {user.height} cm
                        </span>
                      )}
                      {user.weight && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                            />
                          </svg>
                          {user.weight} kg
                        </span>
                      )}
                      {user.age && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {user.age} yaş
                        </span>
                      )}
                      {user.skinColor && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z"
                            />
                          </svg>
                          {user.skinColor}
                        </span>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Profile Photos Section */}
          {user.photos && user.photos.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Profil Fotoğrafları
                </h3>
                {isEditing && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-200"
                    onClick={() =>
                      document.getElementById("photo-upload").click()
                    }
                    disabled={uploadingPhoto}
                  >
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    {uploadingPhoto ? "Yükleniyor..." : "Fotoğraf Ekle"}
                  </button>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={`http://localhost:3001${photo}`}
                      alt={`Fotoğraf ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg shadow-md border-2 border-white group-hover:border-blue-300 transition-all duration-200"
                    />
                    <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Fotoğrafı kaldır"
                        onClick={() => handlePhotoRemove(photo)}
                        disabled={uploadingPhoto}
                      >
                        <svg
                          className="w-3 h-3"
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
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                {user.photos.length} fotoğraf yüklendi
              </p>
            </div>
          )}

          {/* Add Photos Section when no photos exist */}
          {(!user.photos || user.photos.length === 0) && (
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Profil Fotoğrafları
              </h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-gray-600 mb-2">Henüz fotoğraf yüklenmemiş</p>
                <p className="text-sm text-gray-500">
                  Profil fotoğraflarınızı ekleyerek profilinizi daha çekici hale
                  getirin
                </p>
                {isEditing && (
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    onClick={() =>
                      document.getElementById("first-photo-upload").click()
                    }
                    disabled={uploadingPhoto}
                  >
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
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    {uploadingPhoto ? "Yükleniyor..." : "İlk Fotoğrafı Ekle"}
                  </button>
                )}
                <input
                  id="first-photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-red-400 mr-2"
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
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 text-green-400 mr-2"
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
                  <span className="text-green-800">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şehir *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  >
                    <option value="">Şehir seçin</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doğum Tarihi *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Physical Attributes - Only for Service Providers */}
            {user.userType === "isletme" && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Fiziksel Özellikler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Boy (cm)
                    </label>
                    <input
                      type="number"
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="100"
                      max="250"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kilo (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="30"
                      max="200"
                      step="0.5"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="70"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Yaş
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="18"
                      max="100"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ten Rengi
                    </label>
                    <select
                      name="skinColor"
                      value={formData.skinColor}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Ten rengi seçin</option>
                      {skinColorOptions.map((color) => (
                        <option key={color.value} value={color.value}>
                          {color.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* User Type Specific Fields */}
            {user.userType === "musteri" && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Müşteri Tercihleri
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlgi Alanları ve Tercihler
                  </label>
                  <textarea
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Hangi hizmetlerle ilgileniyorsunuz?"
                  />
                </div>
              </div>
            )}

            {user.userType === "isletme" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fiyat Aralığı *
                  </label>
                  <input
                    type="text"
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sunulan Hizmetler *
                  </label>
                  <textarea
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Hangi hizmetleri sunuyorsunuz?"
                  />
                </div>
              </>
            )}

            {/* Account Information (Read-only) */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hesap Bilgileri
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kullanıcı Tipi
                  </label>
                  <input
                    type="text"
                    value={
                      user.userType === "musteri" ? "Müşteri" : "İlan Veren"
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap Oluşturma Tarihi
                  </label>
                  <input
                    type="text"
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                        : "Bilinmiyor"
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Son Giriş
                  </label>
                  <input
                    type="text"
                    value={
                      user.lastSeen
                        ? new Date(user.lastSeen).toLocaleDateString("tr-TR")
                        : "Bilinmiyor"
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hesap Durumu
                  </label>
                  <input
                    type="text"
                    value={user.isActive ? "Aktif" : "Pasif"}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Online Durumu
                  </label>
                  <input
                    type="text"
                    value={user.isOnline ? "Çevrimiçi" : "Çevrimdışı"}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* User Statistics Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                İstatistikler ve Aktivite
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {user.photos ? user.photos.length : 0}
                  </div>
                  <div className="text-sm text-blue-700">Fotoğraf</div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {user.rating ? user.rating.toFixed(1) : "0.0"}
                  </div>
                  <div className="text-sm text-green-700">Puan</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {user.reviewCount || 0}
                  </div>
                  <div className="text-sm text-purple-700">Değerlendirme</div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.userType === "musteri" && user.preferences && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Müşteri Tercihleri
                    </h4>
                    <p className="text-sm text-gray-600">{user.preferences}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(true);
                    setSuccessMessage(null);
                    setError(null);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Düzenle
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-2 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Kaydediliyor..." : "Kaydet"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
