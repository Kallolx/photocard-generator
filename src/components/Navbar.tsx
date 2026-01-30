"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CompactCreditDisplay from "./CompactCreditDisplay";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: "URL", href: "/url" },
    { label: "CUSTOM", href: "/custom" },
  ];

  function setShowUpgradeModal(arg0: boolean) {
    throw new Error("Function not implemented.");
  }

  return (
    <nav className="w-full bg-[#faf8f5] border-b-2 border-[#d4c4b0] px-4 md:px-6 py-3 md:py-4 relative z-[100]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-lg md:text-2xl font-lora font-bold text-[#2c2419] tracking-tight">
            Socialcard Generator
          </h1>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-lg font-medium font-inter transition-colors hover:text-[#8b6834] ${
                pathname === link.href
                  ? "text-[#2c2419] border-b-2 border-[#8b6834] pb-1"
                  : "text-[#5d4e37]"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Profile and Mobile Menu */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <CompactCreditDisplay />
          </div>
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#f5f0e8] transition-colors border border-transparent hover:border-[#d4c4b0]/50"
            >
              <div className="w-8 h-8 bg-[#d4c4b0] rounded-full flex items-center justify-center text-[#2c2419] font-bold text-sm border-2 border-[#faf8f5] shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#5d4e37] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#faf8f5] rounded-lg shadow-xl border border-[#d4c4b0] py-1 z-40 overflow-hidden ring-1 ring-black/5">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-[#d4c4b0]/30 bg-[#f5f0e8]/30">
                    <p className="text-sm font-bold text-[#2c2419] truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-[#5d4e37] truncate">
                      {user?.email}
                    </p>
                    <div className="mt-2 text-xs font-semibold text-[#8b6834] bg-[#8b6834]/10 px-2 py-0.5 rounded-full inline-block">
                      {user?.plan || "Free"} Plan
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors"
                    >
                      <Settings className="w-4 h-4 mr-3 text-[#8b6834]" />
                      Settings
                    </Link>

                    {/* Mobile Only Credits/Upgrade in Menu */}
                    <div className="sm:hidden px-4 py-2">
                      <CompactCreditDisplay />
                    </div>
                  </div>

                  <div className="border-t border-[#d4c4b0]/30 py-1">
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/";
                      }}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 hover:text-red-800 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#5d4e37] hover:text-[#8b6834] transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#faf8f5] shadow-lg border-t-2 border-[#d4c4b0] z-50 md:hidden">
          <div className="flex flex-col py-4 px-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-sm font-medium font-inter transition-colors hover:text-[#8b6834] px-3 py-3 ${
                  pathname === link.href
                    ? "text-[#2c2419] bg-[#f5f0e8]"
                    : "text-[#5d4e37]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
