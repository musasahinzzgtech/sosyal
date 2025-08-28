import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12 px-4 py-6 sm:py-8">
      {/* Hero Section */}
      <div className="text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl p-6 sm:p-8 lg:p-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">OTOMedik</h1>
        <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-3xl mx-auto">
          Türkiye'nin en güvenilir ve profesyonel otomotiv hizmet platformu
        </p>
        <p className="text-base sm:text-lg opacity-90">
          Kaliteli hizmet verenler ile ihtiyaç sahiplerini buluşturuyoruz
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
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
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Misyonumuz</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Otomotiv sektöründe güvenilir, şeffaf ve kaliteli hizmet
            standartları oluşturarak, araç sahiplerinin en uygun ve güvenilir
            servis hizmetlerine kolayca ulaşmasını sağlamak. Teknolojik
            altyapımız ile sektörde dijital dönüşümü hızlandırarak, hem hizmet
            verenlerin hem de müşterilerin memnuniyetini en üst seviyede tutmak.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"
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
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Vizyonumuz</h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Türkiye'nin lider otomotiv hizmet platformu olarak, sektörde
            güvenilirlik ve kalite standartlarını belirleyen, teknoloji odaklı
            çözümlerle otomotiv bakım ve onarım süreçlerini kolaylaştıran,
            uluslararası standartlarda hizmet veren bir ekosistem oluşturmak.
          </p>
        </div>
      </div>

      {/* Platform Description */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
          Platformumuz Hakkında
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                      <div>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
                OTOMedik'da arabanızı tamir ettirebileceğiniz işletmelere
                ulaşabilceksiniz. Türkiye'nin en güvenilir ve profesyonel otomotiv
                hizmet platformunda, kaliteli hizmet verenler ile ihtiyaç
                sahiplerini buluşturuyoruz. Güvenli, hızlı ve memnuniyet garantili
                hizmet deneyimi sunuyoruz.
              </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Güvenilir ve doğrulanmış işletmeler
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">
                  Şeffaf fiyatlandırma ve değerlendirmeler
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">7/24 müşteri desteği</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Kolay ve hızlı iletişim</span>
              </div>
            </div>
          </div>
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 sm:p-8 rounded-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                Neden OTOMedik?
              </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">•</span>
                Binlerce doğrulanmış işletme
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">•</span>
                Detaylı filtreleme seçenekleri
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">•</span>
                Gerçek müşteri yorumları
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">•</span>
                Güvenli ödeme seçenekleri
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-2">•</span>
                Hızlı ve güvenilir hizmet
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Nasıl Çalışır?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                Hesap Oluşturun
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Hızlı ve güvenli kayıt işlemi ile OTOMedik'a katılın. Kişisel
                bilgileriniz güvenle korunur.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                İşletme Bulun
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Gelişmiş filtreler ile arabanızı tamir ettirebileceğiniz işletmeyi
                keşfedin. Konum, hizmet türü ve değerlendirmelere göre arama
                yapın.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                İletişime Geçin
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Güvenli iletişim kanalları ile işletme sahibine ulaşın. Mesajlaşma
                sistemi ile doğrudan iletişim kurabilirsiniz.
              </p>
            </div>
        </div>
      </div>

      {/* Values */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 sm:p-8 rounded-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
          Değerlerimiz
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                      <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
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
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Güvenilirlik</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Doğrulanmış işletmeler ve şeffaf süreçler
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
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
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Hız</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Hızlı ve etkili hizmet süreçleri
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600"
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
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Kalite</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Yüksek kaliteli hizmet standartları
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 sm:mb-2">Topluluk</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Güçlü ve destekleyici topluluk
              </p>
            </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 sm:p-8 rounded-xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Hemen Başlayın</h2>
        <p className="text-lg sm:text-xl mb-4 sm:mb-6 opacity-90">
          Arabanızın bakımı için güvenilir işletmeleri keşfedin
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Link to="/">
            <button className="bg-white text-blue-600 px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm sm:text-base w-full sm:w-auto">
              İşletme Ara
            </button>
          </Link>
          <Link to="/kayit-ol">
            <button className="border-2 border-white text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors text-sm sm:text-base w-full sm:w-auto">
              Kayıt Ol
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
