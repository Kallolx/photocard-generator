"use client";

import Link from "next/link";
import Navbar from "../components/Navbar";
import { ArrowLeft, LayoutDashboard, Link as LinkIcon, ChefHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col font-dm-sans">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-16 md:-mt-16">
        <div className="w-full max-w-2xl mx-auto">
          <div className="border-2 border-[#d4c4b0] bg-white overflow-hidden">
            <div className="bg-[#2c2419] px-8 py-5 flex items-center gap-4">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#8b6834]/60" />
                <span className="w-3 h-3 rounded-full bg-[#8b6834]/40" />
                <span className="w-3 h-3 rounded-full bg-[#8b6834]/20" />
              </div>
              <span className="text-[#d4c4b0] text-xs font-mono tracking-widest uppercase">
                404 — page not found
              </span>
            </div>

            <div className="px-8 py-14 flex flex-col items-center text-center">
              <p className="text-[120px] md:text-[160px] font-lora font-bold leading-none text-[#2c2419]/[0.06] select-none">
                404
              </p>

              <div className="-mt-12 md:-mt-16 relative z-10 mb-10">
                <h1 className="text-3xl md:text-4xl font-lora font-bold text-[#2c2419] mb-3">
                  Oops — wrong turn
                </h1>
                <p className="text-[#5d4e37] text-base leading-relaxed max-w-md mx-auto">
                  The page you're looking for doesn't exist, was moved, or the link is broken. Head back and pick a direction.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-10">
                {[
                  { href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Dashboard" },
                  { href: "/url", icon: <LinkIcon className="w-4 h-4" />, label: "URL Newscard" },
                  { href: "/recipe", icon: <ChefHat className="w-4 h-4" />, label: "Recipe Card" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-center gap-2 px-4 py-3 border border-[#d4c4b0] text-sm font-semibold text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419] hover:border-[#8b6834]/40 transition-all"
                  >
                    <span className="text-[#8b6834]">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 bg-[#8b6834] text-[#faf8f5] px-8 py-3 font-inter font-bold text-sm uppercase tracking-widest hover:bg-[#2c2419] transition-colors border-2 border-[#8b6834] hover:border-[#2c2419]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </div>

            <div className="h-1 bg-gradient-to-r from-[#8b6834] via-[#d4a853] to-[#8b6834]" />
          </div>
        </div>
      </main>
    </div>
  );
}
