const Contact = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 py-6 sm:py-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">İletişim</h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600">
          Bizimle iletişime geçin
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Contact Form */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">Mesaj Gönderin</h2>
          <form className="space-y-4 sm:space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Adınız ve soyadınız"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-posta
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ornek@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Konu
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Mesajınızın konusu"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Mesaj
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Mesajınızı buraya yazın..."
              ></textarea>
            </div>
            
            <div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 font-medium"
              >
                Mesaj Gönder
              </button>
            </div>
          </form>
        </div>

        {/* Contact Information */}
        <div className="space-y-6 sm:space-y-8">
          {/* Contact Info */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">İletişim Bilgileri</h3>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">E-posta</h4>
                  <p className="text-sm sm:text-base text-gray-600">info@otomedik.com</p>
                  <p className="text-sm sm:text-base text-gray-600">destek@otomedik.com</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Telefon</h4>
                  <p className="text-sm sm:text-base text-gray-600">+90 (212) 555 0123</p>
                  <p className="text-sm sm:text-base text-gray-600">+90 (532) 555 0123</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Adres</h4>
                  <p className="text-sm sm:text-base text-gray-600">Levent Mahallesi, Büyükdere Caddesi</p>
                  <p className="text-sm sm:text-base text-gray-600">No: 123, Şişli/İstanbul</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Çalışma Saatleri</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Pazartesi - Cuma</span>
                <span className="text-sm sm:text-base font-medium text-gray-900">09:00 - 18:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Cumartesi</span>
                <span className="text-sm sm:text-base font-medium text-gray-900">10:00 - 16:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm sm:text-base text-gray-600">Pazar</span>
                <span className="text-sm sm:text-base font-medium text-gray-900">Kapalı</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">Sosyal Medya</h3>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
