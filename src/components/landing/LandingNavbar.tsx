'use client';

import Link from 'next/link';

interface NavbarProps {
  lang: 'en' | 'bn';
  setLang: (lang: 'en' | 'bn') => void;
  t: any;
}

export default function LandingNavbar({ lang, setLang, t }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full bg-[#faf8f5]/95 backdrop-blur-sm z-50 border-b-2 border-[#d4c4b0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#8b6834] border-2 border-[#6b4e25] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#faf8f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <span className="text-2xl font-lora font-bold text-[#2c2419]">
              Newscard
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-[#5d4e37] hover:text-[#8b6834] transition-colors font-inter font-medium"              
            >
              {t.nav.home}
            </a>
            <a 
              href="#how-it-works" 
              className="text-[#5d4e37] hover:text-[#8b6834] transition-colors font-inter font-medium"
            >
              {t.nav.howItWorks}
            </a>
            <a 
              href="#features" 
              className="text-[#5d4e37] hover:text-[#8b6834] transition-colors font-inter font-medium"
            >
              {t.nav.features}
            </a>
            <a 
              href="#pricing" 
              className="text-[#5d4e37] hover:text-[#8b6834] transition-colors font-inter font-medium"
            >
              {t.nav.pricing}
            </a>
            <a 
              href="#about" 
              className="text-[#5d4e37] hover:text-[#8b6834] transition-colors font-inter font-medium"
            >
              {t.nav.about}
            </a>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="p-2.5 border-2 border-[#d4c4b0] hover:border-[#8b6834] hover:bg-[#f5f0e8] transition-all"
              aria-label={lang === 'en' ? 'Switch to Bangla' : 'Switch to English'}
              title={lang === 'en' ? 'বাংলা' : 'English'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5d4e37]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
            <Link
              href="/auth/login"
              className="px-6 py-2.5 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold border-2 border-[#6b4e25] hover:bg-[#6b4e25] transition-all"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
