"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Github,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface LandingFooterProps {
  t: any;
}

export default function LandingFooter({ t }: LandingFooterProps) {
  return (
    <footer className="bg-[#2c2419] text-[#faf8f5] py-24 px-4 relative overflow-hidden border-t-8 border-[#8b6834]">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#d4c4b0 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-none bg-[#8b6834] flex items-center justify-center border-2 border-[#8b6834]">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black text-white uppercase tracking-tight">
                Socialcard
              </span>
            </div>
            <p className="text-[#b49e82] mb-10 leading-relaxed max-w-sm font-medium">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram, Github].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-none bg-transparent border-2 border-[#5d4e37] flex items-center justify-center text-[#d4c4b0] hover:bg-[#8b6834] hover:border-[#8b6834] hover:text-white transition-all transform hover:-translate-y-1"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-[#8b6834]">
              {t.footer.product}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t.footer.howItWorks, href: "#how-it-works" },
                { label: t.footer.features, href: "#features" },
                { label: t.footer.pricing, href: "#pricing" },
                { label: t.footer.templates, href: "/dashboard" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-[#d4c4b0] hover:text-white transition-colors flex items-center gap-3 font-bold group text-sm"
                  >
                    <ArrowRight className="w-4 h-4 text-[#8b6834] transform scale-0 group-hover:scale-100 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-[#8b6834]">
              {t.footer.company}
            </h4>
            <ul className="space-y-4">
              {[
                { label: t.footer.about, href: "#about" },
                { label: t.footer.contact, href: "/contact" },
                { label: t.footer.privacy, href: "/privacy" },
                { label: t.footer.terms, href: "/terms" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    href={link.href}
                    className="text-[#d4c4b0] hover:text-white transition-colors flex items-center gap-3 font-bold group text-sm"
                  >
                    <ArrowRight className="w-4 h-4 text-[#8b6834] transform scale-0 group-hover:scale-100 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t-2 border-[#5d4e37]/40 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[#b49e82] text-xs font-black uppercase tracking-widest">
              © 2026 Socialcard. {t.footer.rights}.
            </p>
            <div className="flex items-center gap-10 text-[10px] font-black uppercase tracking-widest text-[#5d4e37]">
              <a href="#" className="hover:text-[#8b6834] transition-colors">
                Security
              </a>
              <a href="#" className="hover:text-[#8b6834] transition-colors">
                Status
              </a>
              <a href="#" className="hover:text-[#8b6834] transition-colors">
                Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
