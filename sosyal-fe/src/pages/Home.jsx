import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSkinTone, setSelectedSkinTone] = useState('');
  const [ageRange, setAgeRange] = useState({ min: 18, max: 50 });
  const [priceRange, setPriceRange] = useState({ min: 0, max: 2000 });
  const [weightRange, setWeightRange] = useState({ min: 40, max: 100 });
  const [heightRange, setHeightRange] = useState({ min: 150, max: 190 });
  const [isLoading, setIsLoading] = useState(false);
  const [filteredProfiles, setFilteredProfiles] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [cities, setCities] = useState([]);
  const [skinTones, setSkinTones] = useState([]);
  const [error, setError] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Load service providers from backend
  useEffect(() => {
    const loadServiceProviders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Import API service dynamically
        const apiService = (await import('../services/api')).default;
        
        // Get service providers with filters
        const params = new URLSearchParams();
        if (selectedCity) params.append('city', selectedCity);
        
        const serviceProviders = await apiService.getServiceProviders(selectedCity);
        console.log("serviceProviders",serviceProviders);
        if (serviceProviders && serviceProviders.length > 0) {
          // Transform backend data to match frontend format
          const transformedProfiles = serviceProviders.map(provider => ({
            id: provider._id,
            name: `${provider.firstName} ${provider.lastName}`,
            age: provider.birthDate ? calculateAge(new Date(provider.birthDate)) : 25,
            city: provider.city || 'Belirtilmemiş',
            skinTone: provider.preferences?.skinTone || 'Belirtilmemiş',
            priceRange: provider.businessInfo?.priceRange || '₺500-800',
            price: provider.businessInfo?.price || 650,
            weight: provider.preferences?.weight || 60,
            height: provider.preferences?.height || 165,
            description: provider.businessInfo?.description || 'Açıklama bulunmuyor.',
            images: provider.photos && provider.photos.length > 0 
              ? provider.photos.map(photo => `http://localhost:3001/uploads/photos/${photo}`) // Default avatar for now
              : ['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face']
          }));
          
          setProfiles(transformedProfiles);
          
          // Extract unique cities and skin tones from profiles
          const uniqueCities = [...new Set(transformedProfiles.map(p => p.city).filter(city => city !== 'Belirtilmemiş'))];
          const uniqueSkinTones = [...new Set(transformedProfiles.map(p => p.skinTone).filter(tone => tone !== 'Belirtilmemiş'))];
          
          setCities(uniqueCities);
          setSkinTones(uniqueSkinTones);
        } else {
          setProfiles([]);
          setCities([]);
          setSkinTones([]);
        }
      } catch (error) {
        console.error('Failed to load service providers:', error);
        setError('Hizmet sağlayıcılar yüklenemedi');
        setProfiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceProviders();
  }, [selectedCity]);

  // Filter profiles based on selected criteria
  useEffect(() => {
    if (profiles.length === 0) {
      setFilteredProfiles([]);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = profiles.filter(profile => {
        if (selectedCity && profile.city !== selectedCity) return false;
        if (selectedSkinTone && profile.skinTone !== selectedSkinTone) return false;
        if (profile.age < ageRange.min || profile.age > ageRange.max) return false;
        if (profile.price < priceRange.min || profile.price > priceRange.max) return false;
        if (profile.weight < weightRange.min || profile.weight > weightRange.max) return false;
        if (profile.height < heightRange.min || profile.height > heightRange.max) return false;
        return true;
      });
      console.log(filtered);
      setFilteredProfiles(filtered);
      setIsLoading(false);
    }, 300); // Reduced delay since we're not simulating API calls

    return () => clearTimeout(timer);
  }, [profiles, selectedCity, selectedSkinTone, ageRange, priceRange, weightRange, heightRange]);

  // Helper function to calculate age from birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const nextImage = (profileId) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [profileId]: ((prev[profileId] || 0) + 1) % (profiles.find(p => p.id === profileId)?.images.length || 1)
    }));
  };

  const prevImage = (profileId) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [profileId]: prev[profileId] === 0 
        ? (profiles.find(p => p.id === profileId)?.images.length || 1) - 1 
        : (prev[profileId] || 0) - 1
    }));
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedSkinTone('');
    setAgeRange({ min: 18, max: 50 });
    setPriceRange({ min: 0, max: 2000 });
    setWeightRange({ min: 40, max: 100 });
    setHeightRange({ min: 150, max: 190 });
  };

  const RangeSlider = ({ label, value, onChange, min, max, step, unit }) => (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm text-gray-500">
          {value.min} - {value.max} {unit}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-lg">
          <div 
            className="h-2 bg-blue-500 rounded-lg absolute"
            style={{
              left: `${((value.min - min) / (max - min)) * 100}%`,
              right: `${100 - ((value.max - min) / (max - min)) * 100}%`
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.min}
          onChange={(e) => onChange({ ...value, min: parseInt(e.target.value) })}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value.max}
          onChange={(e) => onChange({ ...value, max: parseInt(e.target.value) })}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );

  const handleSendMessage = (profile) => {
    // Navigate to messages page with target user info
    navigate('/messages', { 
      state: { 
        targetUser: {
          id: profile.id,
          name: profile.name,
          avatar: profile.images && profile.images.length > 0 ? profile.images[0] : null
        }
      } 
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hata</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Ana Sayfa</h1>
          <p className="text-gray-600">Hizmet sağlayıcıları keşfedin ve filtreleyin</p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Filtreler</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showAdvancedFilters ? 'Basit Filtreler' : 'Gelişmiş Filtreler'}
              </button>
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şehir
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Şehirler</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* Skin Tone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ten Rengi
              </label>
              <select
                value={selectedSkinTone}
                onChange={(e) => setSelectedSkinTone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tüm Ten Renkleri</option>
                {skinTones.map((tone) => (
                  <option key={tone} value={tone}>
                    {tone}
                  </option>
                ))}
              </select>
            </div>

            {/* Age Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yaş Aralığı
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="18"
                  max="50"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange({ ...ageRange, min: parseInt(e.target.value) })}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="18"
                  max="50"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange({ ...ageRange, max: parseInt(e.target.value) })}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiyat Aralığı (₺)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) })}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                  className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <RangeSlider
                label="Kilo Aralığı (kg)"
                value={weightRange}
                onChange={setWeightRange}
                min={40}
                max={100}
                step={1}
                unit="kg"
              />
              <RangeSlider
                label="Boy Aralığı (cm)"
                value={heightRange}
                onChange={setHeightRange}
                min={150}
                max={190}
                step={1}
                unit="cm"
              />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Sonuçlar ({filteredProfiles.length})
            </h2>
            {isLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm text-gray-500">Yükleniyor...</span>
              </div>
            )}
          </div>

          {filteredProfiles.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-500">Seçtiğiniz kriterlere uygun hizmet sağlayıcı bulunamadı. Filtreleri değiştirmeyi deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile) => (
                <div key={profile.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Image Gallery */}
                  <div className="relative h-64 bg-gray-100">
                    {profile.images && profile.images.length > 0 ? (
                      <>
                        <img
                          src={profile.images[currentImageIndex[profile.id] || 0]}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                        {profile.images.length > 1 && (
                          <>
                            <button
                              onClick={() => prevImage(profile.id)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => nextImage(profile.id)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all duration-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                              {profile.images.map((_, index) => (
                                <div
                                  key={index}
                                  className={`w-2 h-2 rounded-full ${
                                    index === (currentImageIndex[profile.id] || 0) ? 'bg-white' : 'bg-white bg-opacity-50'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{profile.name}</h3>
                        <p className="text-sm text-gray-600">{profile.age} yaşında • {profile.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{profile.priceRange}</p>
                        <p className="text-sm text-gray-500">{profile.price} ₺</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Ten:</span>
                        <span className="ml-2 text-gray-900">{profile.skinTone}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Kilo:</span>
                        <span className="ml-2 text-gray-900">{profile.weight} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Boy:</span>
                        <span className="ml-2 text-gray-900">{profile.height} cm</span>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-4 line-clamp-3">{profile.description}</p>

                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleSendMessage(profile)}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                      >
                        Mesaj Gönder
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                        Profili Gör
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
