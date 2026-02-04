'use client';

import Link from 'next/link';

interface NavbarProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  t: any;
}

export default function LandingNavbar({ lang, setLang, t }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-lg z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Socialcard
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"              
            >
              {t.nav.home}
            </a>
            <a 
              href="#how-it-works" 
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {t.nav.howItWorks}
            </a>
            <a 
              href="#features" 
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {t.nav.features}
            </a>
            <a 
              href="#pricing" 
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {t.nav.pricing}
            </a>
            <a 
              href="#about" 
              className="text-gray-700 hover:text-purple-600 transition-colors font-medium"
            >
              {t.nav.about}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2.5 rounded-lg border border-gray-300 hover:border-purple-500 hover:bg-purple-50 transition-all"
              aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
              title={lang === 'en' ? 'বাংলা' : 'English'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg transition-all"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
