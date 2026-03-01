"use client";

import Link from "next/link";
import Image from "next/image";

interface NavbarProps {
  lang: "en" | "bn";
  setLang: (lang: "en" | "bn") => void;
  t: any;
}

export default function LandingNavbar({ lang, setLang, t }: NavbarProps) {
  return (
    <nav className="fixed top-0 w-full bg-white z-50 border-b-2 border-[#d4c4b0] shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center group">
            <Image
              src="/images/logo.png"
              alt="PhotoCard logo"
              width={140}
              height={40}
              className="object-contain h-14"
            />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {[
              { id: "home", label: t.nav.home },
              { id: "how-it-works", label: t.nav.howItWorks },
              { id: "features", label: t.nav.features },
              { id: "pricing", label: t.nav.pricing },
              { id: "about", label: t.nav.about },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`text-[#5d4e37] hover:text-[#8b6834] transition-colors font-black uppercase tracking-widest ${
                  lang === "bn" ? "text-sm" : "text-xs"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setLang(lang === "en" ? "bn" : "en")}
              className="p-2.5 rounded-none border-2 border-[#d4c4b0]/40 text-[#5d4e37] hover:border-[#8b6834]/30 hover:bg-[#f5f0e8] transition-all"
              aria-label={
                lang === "en" ? "Switch to Bangla" : "Switch to English"
              }
              title={lang === "en" ? "বাংলা" : "English"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </button>
            <Link
              href="/auth/login"
              className="px-6 py-3 rounded-none bg-[#8b6834] text-white font-black uppercase text-xs tracking-widest border-2 border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] transition-all shadow-none"
            >
              {t.nav.getStarted}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
