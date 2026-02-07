import Moment from "moment";

export default function CombinedProfileCard() {
  let user = JSON.parse(localStorage.getItem("user") ?? "null");
  
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header Section with Gradient Background */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-8 relative">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600">
              {user && user.avatar ? (
                <img src={user.avatar} alt="user" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white">
                  {user && user.fullName ? user.fullName.charAt(0).toUpperCase() : 'A'}
                </div>
              )}
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-white mb-2">
              {user && user.fullName ? user.fullName : 'Admin'}
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-3 text-white/90 mb-3">
              <span className="flex items-center gap-2">
                <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {user && user.phone ? user.phone : '+998901234567'}
              </span>
              {user && user.role && (
                <>
                  <span className="hidden md:inline text-white/50">•</span>
                  <span className="flex items-center gap-2">
                    <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {user.role}
                  </span>
                </>
              )}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
              <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              A'zo bo'lgan: {user && user.createdAt ? Moment(user.createdAt).format("DD.MM.YYYY") : Moment(new Date()).format("DD.MM.YYYY")}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Login Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
              </svg>
              Login
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {user && user.login ? user.login : 'admin'}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Telefon
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {user && user.phone ? user.phone : '+998901234567'}
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Rol
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 rounded-full font-semibold">
              <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {user && user.role ? user.role : 'ADMIN'}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              To'liq ism
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {user && user.fullName ? user.fullName : 'Admin'}
            </p>
          </div>

          {/* Created Date */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Ro'yxatdan o'tdi
            </div>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {user && user.createdAt ? Moment(user.createdAt).format("DD MMMM, YYYY") : Moment(new Date()).format("DD MMMM, YYYY")}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
              <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Status
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              {user && user.isActive !== false ? 'Faol' : 'Faol emas'}
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                Admin
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Panel
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                {user && user.role ? user.role : 'SUPER'}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Huquq
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                100%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Kirish
              </div>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
                24/7
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Faol
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
