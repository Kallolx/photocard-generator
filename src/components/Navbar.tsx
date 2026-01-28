'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CompactCreditDisplay from './CompactCreditDisplay';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'URL', href: '/url' },
    { label: 'CUSTOM', href: '/custom' },
  ];

  return (
    <nav className="w-full bg-[#faf8f5] border-b-2 border-[#d4c4b0] px-4 md:px-6 py-3 md:py-4 relative">
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
                  ? 'text-[#2c2419] border-b-2 border-[#8b6834] pb-1' 
                  : 'text-[#5d4e37]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Profile and Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* Compact Credit Display */}
          <CompactCreditDisplay />
          
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 md:space-x-3 bg-white px-3 md:px-4 py-2 border-2 border-[#d4c4b0] hover:bg-[#f5f0e8] transition-colors">
            
              <div className="w-7 h-7 md:w-8 md:h-8 bg-[#8b6834] rounded-full flex items-center justify-center">
                <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              <span className="text-xs md:text-sm font-medium font-inter text-[#2c2419] hidden sm:block">
                {user?.name || 'User'}
              </span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-[#5d4e37]" />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#faf8f5] shadow-lg border-2 border-[#d4c4b0] py-2 z-50">
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-inter text-[#2c2419] hover:bg-[#f5f0e8]">
                
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </a>
                <hr className="my-2" />
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/';
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-inter text-[#8b6834] hover:bg-[#f5f0e8] w-full text-left">
                
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-[#5d4e37] hover:text-[#8b6834] transition-colors">
          
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
                    ? 'text-[#2c2419] bg-[#f5f0e8]' 
                    : 'text-[#5d4e37]'
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