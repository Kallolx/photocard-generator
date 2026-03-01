"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Link as LinkIcon,
  VideoIcon,
  Edit,
  Quote,
  BarChart3,
  GitCompare,
  Megaphone,
  Home,
  Image as ImageIcon,
  FileText,
  Moon,
  Heart,
  Lock,
  X,
  Settings,
  LogOut,
  Zap,
  LayoutDashboard,
  Layers,
  HelpCircle,
  Scissors,
  LayoutGrid,
  Languages,
  Newspaper,
  ChevronDown,
} from "lucide-react";

interface DashboardSidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  onUpgrade: (feature: string) => void;
  user: { name?: string; email?: string; plan?: string } | null;
  logout: () => void;
  isFreeUser: boolean;
}

export default function DashboardSidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  onUpgrade,
  user,
  logout,
  isFreeUser,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const [cardTypesOpen, setCardTypesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cardCategories = [
    {
      name: "News & Social",
      cards: [
        { id: "url", label: "URL Newscard", href: "/url", icon: <LinkIcon className="w-4 h-4" />, locked: false },
        { id: "comment", label: "Comment/Quote", href: "/comment", icon: <Quote className="w-4 h-4" />, locked: isFreeUser },
        { id: "poll", label: "Poll Card", href: "/poll", icon: <BarChart3 className="w-4 h-4" />, locked: isFreeUser },
        { id: "compare", label: "Compare Card", href: "/compare", icon: <GitCompare className="w-4 h-4" />, locked: isFreeUser },
      ],
    },
    {
      name: "Business & Marketing",
      cards: [
        { id: "video", label: "Video Card", href: "/videocard", icon: <VideoIcon className="w-4 h-4" />, locked: isFreeUser },
        { id: "marketing", label: "Marketing Card", href: "/marketing", icon: <Megaphone className="w-4 h-4" />, locked: isFreeUser },
        { id: "realestate", label: "Real Estate Card", href: "/realestate", icon: <Home className="w-4 h-4" />, locked: isFreeUser },
        { id: "thumbnail", label: "Thumbnail Card", href: "/thumbnail", icon: <ImageIcon className="w-4 h-4" />, locked: isFreeUser },
      ],
    },
    {
      name: "Personal & Creative",
      cards: [
        { id: "custom", label: "Custom Card", href: "/custom", icon: <Edit className="w-4 h-4" />, locked: isFreeUser },
        { id: "info", label: "Info Card", href: "/info", icon: <FileText className="w-4 h-4" />, locked: isFreeUser },
        { id: "islamic", label: "Islamic Card", href: "/islamic", icon: <Moon className="w-4 h-4" />, locked: isFreeUser },
        { id: "wish", label: "Wish Card", href: "/wish", icon: <Heart className="w-4 h-4" />, locked: isFreeUser },
      ],
    },
  ];

  const allCardTypes = cardCategories.flatMap((c) => c.cards);
  const isOnCardType = allCardTypes.some((c) => c.href === pathname);

  const otherTools = [
    { label: "Background Remover", href: "/background-remover", icon: <Scissors className="w-5 h-5" /> },
    { label: "Collage Maker", href: "/collage", icon: <LayoutGrid className="w-5 h-5" /> },
    { label: "Bangla Converter", href: "/bangla-converter", icon: <Languages className="w-5 h-5" /> },
  ];

  const NavItem = ({
    href,
    icon,
    label,
    isActive = false,
    locked = false,
    onClick,
  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    isActive?: boolean;
    locked?: boolean;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <Link
      href={locked ? "#" : href}
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-none transition-all font-medium ${
        isActive
          ? "bg-[#8b6834] text-white"
          : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419]"
      } ${locked ? "opacity-75" : ""}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      {locked && <Lock className="w-3.5 h-3.5" />}
    </Link>
  );

  return (
    <>
      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#2c2419]/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 h-full bg-white border-r border-[#d4c4b0]/40 flex flex-col
          transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header (Logo) */}
        <div className="h-20 flex items-center px-6 border-b border-[#d4c4b0]/30 shadow-sm relative">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-none bg-gradient-to-br from-[#8b6834] to-[#5d4e37] flex items-center justify-center text-white group-hover:shadow-none transition-shadow">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-xl font-lora font-bold text-[#2c2419] tracking-tight group-hover:text-[#8b6834] transition-colors">
              Socialcard
            </span>
          </Link>
          <button
            className="lg:hidden absolute right-4 p-2 text-[#5d4e37] hover:bg-[#f5f0e8] rounded-none transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 no-scrollbar">
          <div className="space-y-1 mb-8">
            <p className="px-4 text-xs font-bold text-[#b49e82] uppercase tracking-wider mb-2">
              Main
            </p>
            <NavItem
              href="/dashboard"
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
            />
            <NavItem
              href="/news"
              icon={<Newspaper className="w-5 h-5" />}
              label="Today's News"
              isActive={pathname === "/news"}
              locked={isFreeUser}
              onClick={(e) => {
                if (isFreeUser) {
                  e.preventDefault();
                  onUpgrade("Today's News Feed");
                }
              }}
            />

            {/* Card Types accordion */}
            <div>
              <button
                onClick={() => setCardTypesOpen(!cardTypesOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-all font-medium ${
                  isOnCardType
                    ? "bg-[#8b6834]/10 text-[#8b6834]"
                    : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5" />
                  <span>Card Types</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    cardTypesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {cardTypesOpen && (
                <div className="ml-4 border-l-2 border-[#d4c4b0]/50 pl-3 mt-1 mb-2 space-y-5">
                  {cardCategories.map((cat) => (
                    <div key={cat.name}>
                      <p className="px-2 pt-1 pb-2 text-[9px] font-black text-[#b49e82] uppercase tracking-[0.15em]">
                        {cat.name}
                      </p>
                      <div className="space-y-0.5">
                        {cat.cards.map((card) => {
                          const isActive = pathname === card.href;
                          return (
                            <Link
                              key={card.id}
                              href={card.locked ? "#" : card.href}
                              onClick={(e) => {
                                if (card.locked) {
                                  e.preventDefault();
                                  onUpgrade(card.label);
                                }
                              }}
                              className={`flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all ${
                                isActive
                                  ? "bg-[#8b6834] text-white"
                                  : card.locked
                                    ? "text-[#b49e82] hover:bg-[#f5f0e8] hover:text-[#5d4e37]"
                                    : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419]"
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <span className={isActive ? "text-white/80" : card.locked ? "text-[#d4c4b0]" : "text-[#8b6834]"}>
                                  {card.icon}
                                </span>
                                {card.label}
                              </span>
                              {card.locked && <Lock className="w-3 h-3 shrink-0 text-[#d4c4b0]" />}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1 mb-8">
            <p className="px-4 text-xs font-bold text-[#b49e82] uppercase tracking-wider mb-2">
              Editor Tools
            </p>
            {otherTools.map((tool) => (
              <NavItem
                key={tool.label}
                href={tool.href}
                icon={tool.icon}
                label={tool.label}
                isActive={pathname === tool.href}
              />
            ))}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-bold text-[#b49e82] uppercase tracking-wider mb-2">
              Support
            </p>
            <NavItem
              href="/settings"
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              isActive={pathname === "/settings"}
            />
            <NavItem
              href="#"
              icon={<HelpCircle className="w-5 h-5" />}
              label="Help Center"
            />
          </div>

          {/* Free User Upgrade Banner */}
          {mounted && isFreeUser && (
            <div className="mt-8 mx-4 p-4 rounded-none bg-gradient-to-br from-[#8b6834]/10 to-[#8b6834]/5 border border-[#8b6834]/20 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-none bg-[#8b6834] flex items-center justify-center text-white mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#2c2419] mb-1">
                Unlock Premium
              </h4>
              <p className="text-xs text-[#5d4e37] mb-3">
                Get access to all card types and remove watermarks.
              </p>
              <button
                onClick={() => onUpgrade("Premium Features")}
                className="w-full py-2 bg-[#8b6834] text-white text-xs font-bold rounded-none hover:bg-[#2c2419] transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Footer (User Info & Logout) */}
        <div className="p-4 border-t border-[#d4c4b0]/40 bg-[#faf8f5]/50">
          {mounted && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-none bg-white border border-[#d4c4b0]/40">
              <div className="w-10 h-10 rounded-none bg-[#e8dcc8] flex items-center justify-center text-[#8b6834] font-bold border-2 border-white shadow-none flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#2c2419] truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-[#5d4e37] truncate">{user?.email}</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-500 rounded-none transition-all border border-red-200 hover:border-red-500"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
