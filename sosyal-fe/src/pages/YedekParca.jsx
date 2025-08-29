import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

const YedekParca = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sample categories
  const categories = [
    { id: "all", name: "Tümü", icon: "🔧" },
    { id: "motor", name: "Motor", icon: "🏍️" },
    { id: "fren", name: "Fren Sistemi", icon: "🛑" },
    { id: "suspansiyon", name: "Süspansiyon", icon: "🔄" },
    { id: "elektrik", name: "Elektrik", icon: "⚡" },
    { id: "lastik", name: "Lastik & Jant", icon: "🛞️" },
    { id: "akü", name: "Akü & Şarj", icon: "🔋" },
    { id: "filtre", name: "Filtreler", icon: "🧽" },
    { id: "yag", name: "Yağ & Sıvı", icon: "🛢️" },
  ];

  // Sample products data
  const sampleProducts = [
    {
      id: 1,
      name: "Motor Yağı 5W-30",
      category: "yag",
      price: 89.99,
      originalPrice: 120.0,
      rating: 4.5,
      reviewCount: 128,
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop",
      inStock: true,
      brand: "Castrol",
      description: "Yüksek performanslı sentetik motor yağı",
    },
    {
      id: 2,
      name: "Fren Balatası Ön",
      category: "fren",
      price: 45.5,
      originalPrice: 65.0,
      rating: 4.3,
      reviewCount: 89,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      inStock: true,
      brand: "Brembo",
      description: "Kaliteli fren balatası seti",
    },
    {
      id: 3,
      name: "Hava Filtresi",
      category: "filtre",
      price: 12.99,
      originalPrice: 18.5,
      rating: 4.7,
      reviewCount: 156,
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop",
      inStock: true,
      brand: "Mann",
      description: "Yüksek verimli hava filtresi",
    },
    {
      id: 4,
      name: "Akü 60Ah",
      category: "akü",
      price: 299.99,
      originalPrice: 399.0,
      rating: 4.6,
      reviewCount: 67,
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop",
      inStock: false,
      brand: "Varta",
      description: "Güçlü ve dayanıklı akü",
    },
    {
      id: 5,
      name: "Amortisör Ön",
      category: "suspansiyon",
      price: 189.99,
      originalPrice: 250.0,
      rating: 4.4,
      reviewCount: 43,
      image:
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
      inStock: true,
      brand: "Sachs",
      description: "Profesyonel amortisör seti",
    },
    {
      id: 6,
      name: "Buji Seti",
      category: "motor",
      price: 24.99,
      originalPrice: 35.0,
      rating: 4.8,
      reviewCount: 234,
      image:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=300&h=300&fit=crop",
      inStock: true,
      brand: "NGK",
      description: "Yüksek kaliteli buji seti",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setProducts(sampleProducts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "popular":
        default:
          return b.reviewCount - a.reviewCount;
      }
    });

  const handleAddToCart = (product) => {
    // TODO: Implement cart functionality
    console.log("Added to cart:", product);
    alert(`${product.name} sepete eklendi!`);
  };

  const handleQuickView = (product) => {
    // TODO: Implement quick view modal
    console.log("Quick view:", product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
              <span className="text-4xl">🔧</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
              Yedek Parça
            </h1>
            <div className="flex items-center justify-center space-x-2 mb-8">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <p className="text-xl text-gray-600">Yedek parça ürünleri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl mb-6">
            <span className="text-4xl">🔧</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-6">
            Yedek Parça
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Araçlarınız için kaliteli ve uygun fiyatlı yedek parçalar. 
            <span className="font-semibold text-blue-600"> Geniş ürün yelpazemiz</span> ve 
            <span className="font-semibold text-indigo-600"> hızlı teslimat</span> seçeneklerimizle hizmetinizdeyiz.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Ürün Ara</label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Ürün adı, marka veya kategori..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg placeholder-gray-400"
                />
                <svg
                  className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300"
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
            </div>

            {/* Sort Dropdown */}
            <div className="lg:w-56">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Sıralama</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-6 py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-300 text-lg appearance-none cursor-pointer"
                >
                  <option value="popular">🔥 Popülerlik</option>
                  <option value="rating">⭐ Puan</option>
                  <option value="price-low">💰 Fiyat (Düşük → Yüksek)</option>
                  <option value="price-high">💰 Fiyat (Yüksek → Düşük)</option>
                </select>
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Kategoriler</h2>
            <p className="text-gray-600">İhtiyacınız olan yedek parça kategorisini seçin</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`group relative p-6 rounded-3xl border-2 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${
                  selectedCategory === category.id
                    ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-xl shadow-blue-500/25"
                    : "border-gray-200 bg-white/80 backdrop-blur-sm hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50 hover:shadow-xl"
                }`}
              >
                <div className={`text-4xl mb-3 transition-transform duration-300 group-hover:scale-110 ${
                  selectedCategory === category.id ? 'animate-pulse' : ''
                }`}>
                  {category.icon}
                </div>
                <div className="font-semibold text-sm">{category.name}</div>
                
                {/* Active indicator */}
                {selectedCategory === category.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedCategory === "all"
                  ? "Tüm Ürünler"
                  : categories.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-600">
                {filteredProducts.length} ürün bulundu
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Grid Görünümü
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ürün Bulunamadı
              </h3>
              <p className="text-gray-600 text-lg">
                Arama kriterlerinize uygun ürün bulunamadı.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Filtreleri Temizle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-105 border border-white/20"
                >
                  {/* Product Image */}
                  <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Badges */}
                    {!product.inStock && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        Stokta Yok
                      </div>
                    )}
                    {product.originalPrice > product.price && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        %{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)} İndirim
                      </div>
                    )}
                    
                    {/* Quick view overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                      <button
                        onClick={() => handleQuickView(product)}
                        className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-300"
                      >
                        Hızlı Bakış
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider bg-gray-100 px-2 py-1 rounded-full">
                        {product.brand}
                      </span>
                      <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
                        <span className="text-yellow-500 mr-1.5">★</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 mb-3 text-lg leading-tight line-clamp-2">
                      {product.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        ₺{product.price.toFixed(2)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through font-medium">
                          ₺{product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                          product.inStock
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {product.inStock ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m6 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                            </svg>
                            Sepete Ekle
                          </span>
                        ) : (
                          "Stokta Yok"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-gradient-to-br from-white/80 to-blue-50/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden Bizi Seçmelisiniz?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kaliteli hizmet ve güvenilir çözümler için doğru adrestesiniz
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kalite Garantisi</h3>
              <p className="text-gray-600 leading-relaxed">Tüm ürünlerimiz orijinal ve garantili. Müşteri memnuniyeti bizim önceliğimiz.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Hızlı Teslimat</h3>
              <p className="text-gray-600 leading-relaxed">24 saat içinde kargoya teslim. Türkiye'nin her yerine hızlı ve güvenli kargo.</p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">7/24 Destek</h3>
              <p className="text-gray-600 leading-relaxed">Teknik destek ve müşteri hizmetleri. Uzman ekibimiz her zaman yanınızda.</p>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-12 pt-12 border-t border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Hemen Alışverişe Başlayın
            </h3>
            <p className="text-gray-600 mb-6">
              Binlerce kaliteli yedek parça sizleri bekliyor
            </p>
            <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl">
              Tüm Ürünleri Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YedekParca;
