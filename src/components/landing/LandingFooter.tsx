'use client';

import Link from 'next/link';

interface LandingFooterProps {
  t: any;
}

export default function LandingFooter({ t }: LandingFooterProps) {
  return (
    <footer className="bg-[#2c2419] text-[#faf8f5] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#8b6834] border-2 border-[#c19a6b] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#faf8f5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <span className="text-3xl font-lora font-bold text-[#faf8f5]">
                Newscard
              </span>
            </div>
            <p className="text-[#c19a6b] mb-6 leading-relaxed font-inter">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#3d3124] border-2 border-[#5d4e37] flex items-center justify-center hover:bg-[#8b6834] hover:border-[#c19a6b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#3d3124] border-2 border-[#5d4e37] flex items-center justify-center hover:bg-[#8b6834] hover:border-[#c19a6b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#3d3124] border-2 border-[#5d4e37] flex items-center justify-center hover:bg-[#8b6834] hover:border-[#c19a6b] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-lora font-bold text-lg mb-4 text-[#c19a6b]">{t.footer.product}</h4>
            <ul className="space-y-3 text-[#a08d74] font-inter">
              <li>
                <a href="#how-it-works" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.howItWorks}
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.features}
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.pricing}
                </a>
              </li>
              <li>
                <Link href="/url" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.templates}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-lora font-bold text-lg mb-4 text-[#c19a6b]">{t.footer.company}</h4>
            <ul className="space-y-3 text-[#a08d74] font-inter">
              <li>
                <a href="#about" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.about}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.contact}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.privacy}
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#faf8f5] transition-colors">
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t-2 border-[#5d4e37] pt-8 text-center">
          <p className="text-[#a08d74] font-inter">
            © 2026 Newscard. {t.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  );
}
