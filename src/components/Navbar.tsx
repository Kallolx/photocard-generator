'use client';

import { useState } from 'react';
import { ChevronDown, User, Settings, LogOut } from 'lucide-react';

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navLinks = [
    { label: 'URL', href: '#', active: true },
    { label: 'CUSTOME', href: '#' },
    { label: 'PLAN', href: '#' },
    { label: 'BATCH', href: '#' },
    { label: 'SUPPORT', href: '#' }
  ];

  return (
    <nav className="w-full bg-[#FFEFEF] border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-lg md:text-2xl font-semibold text-gray-900 tracking-tighter">
            Socialcard Generator
          </h1>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-gray-900 ${
                link.active 
                  ? 'text-gray-900 border-b-2 border-gray-900 pb-1' 
                  : 'text-gray-600'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 md:space-x-3 bg-white rounded-lg px-3 md:px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="text-xs md:text-sm font-medium text-gray-900 hidden sm:block">
              Kamrul Hasan
            </span>
            <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <a
                href="#"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
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
              <a
                href="#"
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}