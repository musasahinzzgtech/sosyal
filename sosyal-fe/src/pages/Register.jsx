import { useState } from "react";
import { Link } from "react-router-dom";

const Register = () => {
  const [userType, setUserType] = useState("musteri");
  const [photos, setPhotos] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  /*
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [map, setMap] = useState(null);
  */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    birthDate: "",
    skinColor: "",
    businessName: "",
    businessAddress: "",
    businessSector: "",
    businessServices: "",
    /*
    latitude: "",
    longitude: "",
    */
  });

  const cities = ["İstanbul", "Ankara", "İzmir", "Adana", "Denizli"];
  /*
  // Google Maps API Key - Replace with your actual API key
  const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

  // Load Google Maps API
  useEffect(() => {
    if (userType === "isletme" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Maps API loaded");
      };
      document.head.appendChild(script);
    }
  }, [userType]);

  // Initialize map when location picker is shown
  useEffect(() => {
    if (showLocationPicker && window.google && !map) {
      const defaultLocation = { lat: 39.9334, lng: 32.8597 }; // Ankara
      const mapInstance = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: defaultLocation,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
        }
      );

      const markerInstance = new window.google.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
      });

      setMap(mapInstance);

      // Handle marker drag events
      markerInstance.addListener("dragend", () => {
        const position = markerInstance.getPosition();
        setSelectedLocation({
          lat: position.lat(),
          lng: position.lng(),
        });
      });

      // Handle map click events
      mapInstance.addListener("click", (event) => {
        const position = event.latLng;
        markerInstance.setPosition(position);
        setSelectedLocation({
          lat: position.lat(),
          lng: position.lng(),
        });
      });
    }
  }, [showLocationPicker, map]);

  // Get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    if (!window.google) return "";

    const geocoder = new window.google.maps.Geocoder();
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

    try {
      const response = await geocoder.geocode({ location: latlng });
      if (response.results[0]) {
        return response.results[0].formatted_address;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return "";
  };

  // Handle location selection
  const handleLocationSelect = async () => {
    if (selectedLocation) {
      const address = await getAddressFromCoordinates(
        selectedLocation.lat,
        selectedLocation.lng
      );
      setFormData((prev) => ({
        ...prev,
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString(),
        address: address,
      }));
      setShowLocationPicker(false);
    }
  };

  // Clear location
  const clearLocation = () => {
    setSelectedLocation(null);
    setFormData((prev) => ({
      ...prev,
      latitude: "",
      longitude: "",
      address: "",
    }));
  };
*/
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);

    // Check photo count limit (max 5 photos)
    if (photos.length + files.length > 5) {
      alert("Maksimum 5 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const validFiles = files.filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          `Dosya ${file.name} çok büyük. Maksimum dosya boyutu 5MB olmalıdır.`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length !== files.length) {
      alert(
        "Bazı dosyalar uygun formatta değil. Sadece 5MB'dan küçük resim dosyaları yüklenebilir."
      );
    }

    if (validFiles.length > 0) {
      const newPhotos = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        preview: URL.createObjectURL(file),
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);

    // Check photo count limit (max 5 photos)
    if (photos.length + files.length > 5) {
      alert("Maksimum 5 fotoğraf yükleyebilirsiniz.");
      return;
    }

    const validFiles = files.filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert(
          `Dosya ${file.name} çok büyük. Maksimum dosya boyutu 5MB olmalıdır.`
        );
        return false;
      }

      return true;
    });

    if (validFiles.length !== files.length) {
      alert(
        "Bazı dosyalar uygun formatta değil. Sadece 5MB'dan küçük resim dosyaları yüklenebilir."
      );
    }

    if (validFiles.length > 0) {
      const newPhotos = validFiles.map((file) => ({
        id: Date.now() + Math.random(),
        file: file,
        preview: URL.createObjectURL(file),
      }));

      setPhotos((prev) => [...prev, ...newPhotos]);
    }
  };

  const removePhoto = (photoId) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === photoId);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== photoId);
    });
  };

  const removeAllPhotos = () => {
    photos.forEach((photo) => {
      URL.revokeObjectURL(photo.preview);
    });
    setPhotos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Şifreler eşleşmiyor!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data for backend (without photos)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city,
        birthDate: formData.birthDate,

        userType: userType, // This will be 'musteri' or 'isletme'
        // Add other service provider fields if applicable
        ...(userType === "isletme" && {
          businessServices: formData.businessServices,
          businessSector: formData.businessSector,
          businessName: formData.businessName,
          businessAddress: formData.businessAddress,
          instagram: formData.instagram,
          facebook: formData.facebook,
        }),
      };

      // Extract photo files for upload
      const photoFiles = photos.map((photo) => photo.file);

      // Import API service dynamically to avoid circular dependencies
      const apiService = (await import("../services/api")).default;
      await apiService.register(userData, photoFiles);

      alert("Hesap başarıyla oluşturuldu! Giriş yapabilirsiniz.");

      // Redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Registration failed:", error);
      let errorMessage = "Kayıt sırasında bir hata oluştu.";

      if (error.message) {
        errorMessage += " " + error.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hesap Oluştur
          </h1>
          <p className="text-gray-600">
            Ustamsağlam'a katılın ve hizmetlerden yararlanın
          </p>
        </div>

        {/* Platform Information Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Neden Ustamsağlam?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Ustamsağlam'da arabanızı tamir ettirebileceğiniz işletmelere
              ulaşabilceksiniz. Türkiye'nin en güvenilir ve profesyonel otomotiv
              hizmet platformunda, kaliteli hizmet verenler ile ihtiyaç
              sahiplerini buluşturuyoruz. Güvenli, hızlı ve memnuniyet garantili
              hizmet deneyimi.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                %100 Güvenli
              </h3>
              <p className="text-blue-800 text-sm">
                SSL şifreleme, güvenli ödeme sistemleri ve kullanıcı doğrulama
                ile tam koruma
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Hızlı & Kolay
              </h3>
              <p className="text-green-800 text-sm">
                Saniyeler içinde hesap oluşturun, dakikalar içinde hizmet bulun
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Müşteri Odaklı
              </h3>
              <p className="text-purple-800 text-sm">
                7/24 destek, memnuniyet garantisi ve kullanıcı dostu arayüz
              </p>
            </div>
          </div>

          {/* Platform Statistics */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Ustamsağlam İstatistikleri
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  25,000+
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Kayıtlı Müşteri
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  8,000+
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Kayıtlı İşletme
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  67
                </div>
                <div className="text-sm text-gray-600 font-medium">Şehir</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  96%
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  Memnuniyet
                </div>
              </div>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Nasıl Çalışır?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  1
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Hesap Oluşturun
                </h4>
                <p className="text-gray-600 text-sm">
                  Hızlı ve güvenli kayıt işlemi ile Ustamsağlam'a katılın
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  2
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  İşletme Bulun
                </h4>
                <p className="text-gray-600 text-sm">
                  Gelişmiş filtreler ile arabanızı tamir ettirebileceğiniz
                  işletmeyi keşfedin
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                  3
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  İletişime Geçin
                </h4>
                <p className="text-gray-600 text-sm">
                  Güvenli iletişim kanalları ile işletme sahibine ulaşın
                </p>
              </div>
            </div>
          </div>

          {/* Security & Privacy */}
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">
                Güvenlik & Gizlilik
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>SSL şifreleme ile veri koruması</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>KVKK uyumlu gizlilik politikası</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Güvenli ödeme sistemleri</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>7/24 teknik destek</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Type Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Kullanıcı Tipi Seçin
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setUserType("musteri")}
              className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                userType === "musteri"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    userType === "musteri" ? "bg-blue-500" : "bg-gray-400"
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Müşteri
                </h3>
                <p className="text-sm text-gray-600">
                  Aranan hizmeti bulmak istiyorum
                </p>
              </div>
            </button>

            <button
              onClick={() => setUserType("isletme")}
              className={`p-6 rounded-lg border-2 transition-all duration-200 ${
                userType === "isletme"
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
              }`}
            >
              <div className="text-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    userType === "isletme" ? "bg-blue-500" : "bg-gray-400"
                  }`}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  İşletme
                </h3>
                <p className="text-sm text-gray-600">Sanayide dükkanım var</p>
              </div>
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Ad *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Adınız"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Soyad *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Soyadınız"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="+90 (5XX) XXX XX XX"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Şehir *
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  <label
                    htmlFor="birthDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Doğum Tarihi *
                  </label>
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {userType === "musteri"
                  ? "Profil Fotoğrafları"
                  : "İşletme Fotoğrafları"}
              </h3>
              <div className="max-w-4xl">
                {photos.length === 0 ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-blue-600"
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

                      <div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          Fotoğraflar yükleyin
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          PNG, JPG veya GIF dosyalarını sürükleyip bırakın veya
                          seçin
                        </p>

                        <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
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
                          Fotoğraflar Seç
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Photo Gallery */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={photo.id} className="relative group">
                          <div className="relative">
                            <img
                              src={photo.preview}
                              alt={`Fotoğraf ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl shadow-lg border-2 border-white group-hover:border-blue-300 transition-all duration-200"
                            />

                            {/* Remove Button */}
                            <button
                              onClick={() => removePhoto(photo.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg opacity-0 group-hover:opacity-100"
                              title="Fotoğrafı kaldır"
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

                            {/* Photo Number Badge */}
                            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                          </div>

                          {/* File Info */}
                          <div className="mt-2 text-center">
                            <p
                              className="text-xs text-gray-600 truncate"
                              title={photo.file.name}
                            >
                              {photo.file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ))}

                      {/* Add More Photos Button */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 cursor-pointer group">
                        <label className="w-full h-32 flex flex-col items-center justify-center cursor-pointer">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-blue-200 transition-all duration-200">
                            <svg
                              className="w-6 h-6 text-blue-600"
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
                          </div>
                          <p className="text-sm text-gray-600 font-medium text-center">
                            Daha fazla fotoğraf ekle
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Photo Management Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">{photos.length}</span>{" "}
                          fotoğraf yüklendi
                        </span>
                        <span className="text-xs text-gray-500">
                          Toplam boyut:{" "}
                          {(
                            photos.reduce(
                              (total, photo) => total + photo.file.size,
                              0
                            ) /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <label className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-200 transition-colors duration-200 cursor-pointer">
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
                          Daha Fazla Ekle
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>

                        {photos.length > 0 && (
                          <button
                            onClick={removeAllPhotos}
                            className="inline-flex items-center px-3 py-2 bg-red-100 text-red-700 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors duration-200"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Tümünü Kaldır
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  * Profil fotoğrafları zorunlu değildir. Daha sonra
                  ekleyebilirsiniz. Maksimum 10 fotoğraf yükleyebilirsiniz.
                </p>
              </div>
            </div>

            {/* Security */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Güvenlik
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Şifre *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="En az 8 karakter"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Şifre Tekrar *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    minLength="8"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Şifrenizi tekrar girin"
                  />
                </div>
              </div>
            </div>

            {userType === "isletme" && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  İşletme Bilgileri
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="businessSector"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Hangi alanda çalışıyorsunuz?
                    </label>
                    <select
                      id="businessSector"
                      name="businessSector"
                      value={formData.businessSector}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value={"elektirik"}>Elektrik</option>
                      <option value={"kaporta"}>Kaporta</option>
                      <option value={"boya"}>Boyama</option>
                      <option value={"cekici"}>Çekici</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Hizmetlerinizi seçin
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="businessServices"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Sanayide dükkanınızda hangi hizmetleri sunuyorsunuz?
                    </label>
                    <textarea
                      id="businessServices"
                      name="businessServices"
                      value={formData.businessServices}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Hangi hizmetleri sunuyorsunuz? Detaylı açıklayın..."
                    />
                  </div>

                  {/* Social Media Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="instagram"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Instagram Hesabı
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.49.49-1.141.807-1.892.807s-1.402-.317-1.892-.807c-.49-.49-.807-1.141-.807-1.892s.317-1.402.807-1.892c.49-.49 1.141-.807 1.892-.807s1.402.317 1.892.807c.49.49.807 1.141.807 1.892s-.317 1.402-.807 1.892z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="instagram"
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="@kullaniciadi"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="facebook"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Facebook Sayfası
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="facebook"
                          name="facebook"
                          value={formData.facebook}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="facebook.com/sayfaadi"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="fullAddress"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      İşletme Konumu
                    </label>

                    {/* Location Picker Button */}
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                      >
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                        <span className="text-blue-600 font-medium">
                          Konum Seçimi Yakında Eklenecek
                        </span>
                      </button>

                      <p className="text-xs text-gray-500">
                        İşletmenizin konumunu Google Maps'ten seçerek
                        müşterilerinizin sizi kolayca bulmasını sağlayın.
                      </p>
                    </div>
                    <div>
                      <label
                        htmlFor="businessName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        İşletme Adı
                      </label>
                    </div>
                    {/* Manual Address Input */}
                    <div className="mt-4">
                      <label
                        htmlFor="businessAddress"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Manuel Adres (Opsiyonel)
                      </label>
                      <textarea
                        id="businessAddress"
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Adresinizi manuel olarak girebilirsiniz..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Submit */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  <span className="font-medium">Kullanım Şartları</span> ve{" "}
                  <span className="font-medium">Gizlilik Politikası</span>'nı
                  kabul ediyorum
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Kayıt Oluşturuluyor...</span>
                  </div>
                ) : (
                  "Hesap Oluştur"
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Zaten hesabınız var mı?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Giriş yapın
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
