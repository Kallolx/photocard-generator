"use client";

import React, { useState } from "react";
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
  Lock,
  Link as LinkIcon,
  Edit,
  MessageSquare,
  FileText,
  Moon,
  BarChart3,
  Heart,
  Megaphone,
  Home,
  Image,
  Mail,
  HelpCircle,
  Shield,
  Clock,
  Quote,
  Package,
  Scissors,
  LayoutGrid,
  Languages,
  VideoIcon,
  GitCompare,
  Newspaper,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CompactCreditDisplay from "./CompactCreditDisplay";
import UpgradeModal from "./UpgradeModal";

type CardType = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  locked: boolean;
  description: string;
};

type CardCategory = {
  name: string;
  cards: CardType[];
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCardsMenuOpen, setIsCardsMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const pathname = usePathname();

  const isFreeUser = user?.plan === "Free";

  const cardCategories: CardCategory[] = [
    {
      name: "News & Social",
      cards: [
        {
          id: "url",
          label: "URL Newscard",
          href: "/url",
          icon: <LinkIcon className="w-4 h-4" />,
          locked: false,
          description: "Convert URLs to newscards",
        },
        {
          id: "comment",
          label: "Comment/Quote",
          href: "/comment",
          icon: <Quote className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Social media comment cards",
        },
        {
          id: "poll",
          label: "Poll Card",
          href: "/poll",
          icon: <BarChart3 className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Interactive poll cards",
        },
        {
          id: "compare",
          label: "Compare Card",
          href: "/compare",
          icon: <GitCompare className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Compare products or services",
        },
      ],
    },
    {
      name: "Business & Marketing",
      cards: [
        {
          id: "video",
          label: "Video Card",
          href: "/videocard",
          icon: <VideoIcon className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Browse the latest news from around the world",
        },
        {
          id: "marketing",
          label: "Marketing Card",
          href: "/marketing",
          icon: <Megaphone className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Promotional & ads cards",
        },
        {
          id: "realestate",
          label: "Real Estate Card",
          href: "/realestate",
          icon: <Home className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Property listings & tours",
        },
        {
          id: "thumbnail",
          label: "Thumbnail Card",
          href: "/thumbnail",
          icon: <Image className="w-4 h-4" />,
          locked: isFreeUser,
          description: "YouTube & video thumbnails",
        },
      ],
    },
    {
      name: "Personal & Creative",
      cards: [
        {
          id: "custom",
          label: "Custom card",
          href: "/custom",
          icon: <Edit className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Create custom cards",
        },
        {
          id: "info",
          label: "Info Card",
          href: "/info",
          icon: <FileText className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Information display cards",
        },
        {
          id: "islamic",
          label: "Islamic Card",
          href: "/islamic",
          icon: <Moon className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Islamic quotes & greetings",
        },
        {
          id: "wish",
          label: "Wish Card",
          href: "/wish",
          icon: <Heart className="w-4 h-4" />,
          locked: isFreeUser,
          description: "Birthday & celebration wishes",
        },
      ],
    },
  ];

  const allCards = cardCategories.flatMap((category) => category.cards);
  const currentCard = allCards.find((card) => card.href === pathname);

  const otherLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      label: "Background Remover",
      href: "/background-remover",
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      label: "Collage",
      href: "/collage",
      icon: <LayoutGrid className="w-4 h-4" />,
    },
    {
      label: "Bangla Converter",
      href: "/bangla-converter",
      icon: <Languages className="w-4 h-4" />,
    },
  ];

  return (
    <nav className="w-full bg-[#faf8f5] border-b-2 border-[#d4c4b0] px-4 md:px-6 py-3 md:py-4 relative z-[100]">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <h1 className="text-lg md:text-2xl font-lora font-bold text-[#2c2419] tracking-tight">
            <Link
              href="/dashboard"
              className="hover:text-[#8b6834] transition-colors"
            >
              Socialcard
            </Link>
          </h1>
        </div>

        {/* Navigation Links - Hidden on mobile */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Cards Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsCardsMenuOpen(!isCardsMenuOpen)}
              onMouseEnter={() => setIsCardsMenuOpen(true)}
              className={`flex items-center gap-2 text-sm font-bold font-inter transition-colors hover:text-[#8b6834] ${
                allCards.some((card) => card.href === pathname)
                  ? "text-[#2c2419]"
                  : "text-[#5d4e37]"
              }`}
            >
              <span>CARD TYPES</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${isCardsMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {isCardsMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsCardsMenuOpen(false)}
                />
                <div
                  className="absolute left-0 top-full mt-2 w-[720px] bg-white rounded-xl shadow-2xl border-2 border-[#d4c4b0] p-6 z-40 overflow-hidden"
                  onMouseLeave={() => setIsCardsMenuOpen(false)}
                >
                  <div className="grid grid-cols-3 gap-0 max-h-96 overflow-y-auto">
                    {cardCategories.map((category, catIndex) => (
                      <div
                        key={category.name}
                        className={`${catIndex < cardCategories.length - 1 ? "border-r border-[#d4c4b0]" : ""}`}
                      >
                        {/* Category Header */}
                        <div className="px-4 py-2 bg-white border-b border-[#d4c4b0]">
                          <p className="text-xs font-bold text-[#8b6834] uppercase tracking-wide">
                            {category.name}
                          </p>
                        </div>

                        {/* Category Cards */}
                        {category.cards.map((card, cardIndex) => (
                          <Link
                            key={card.id}
                            href={card.locked ? "#" : card.href}
                            onClick={(e) => {
                              if (card.locked) {
                                e.preventDefault();
                                if (isFreeUser) {
                                  setUpgradeFeature(card.label);
                                  setShowUpgradeModal(true);
                                  setIsCardsMenuOpen(false);
                                }
                                return;
                              }
                              setIsCardsMenuOpen(false);
                            }}
                            className={`flex items-center gap-3 px-4 py-3 transition-all ${
                              cardIndex < category.cards.length - 1
                                ? "border-b border-[#d4c4b0]"
                                : ""
                            } ${
                              pathname === card.href
                                ? "bg-[#8b6834] text-white"
                                : card.locked
                                  ? "text-gray-400 cursor-not-allowed"
                                  : "text-[#5d4e37] hover:bg-[#f5f0e8]"
                            }`}
                          >
                            <div
                              className={`${
                                pathname === card.href
                                  ? "text-white"
                                  : card.locked
                                    ? "text-[#8b6834]/30"
                                    : "text-[#8b6834]"
                              }`}
                            >
                              {React.cloneElement(
                                card.icon as React.ReactElement<any>,
                                {
                                  className: "w-5 h-5",
                                },
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p
                                  className={`text-sm font-semibold font-inter truncate ${
                                    pathname === card.href
                                      ? "text-white"
                                      : card.locked
                                        ? "text-[#5d4e37]/60"
                                        : "text-[#2c2419]"
                                  }`}
                                >
                                  {card.label}
                                </p>
                                {card.locked && (
                                  <Lock className="w-3 h-3 flex-shrink-0" />
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>

                  {isFreeUser && (
                    <div className="mt-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-[#2c2419] mb-1">
                            Want access to all card types?
                          </p>
                          <p className="text-xs text-[#5d4e37]">
                            Upgrade to unlock all premium features
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setUpgradeFeature("All Premium Card Types");
                            setShowUpgradeModal(true);
                            setIsCardsMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-[#8b6834] text-[#faf8f5] text-sm font-bold hover:bg-[#2c2419] transition-colors whitespace-nowrap"
                        >
                          <Zap className="w-4 h-4" />
                          Upgrade Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Other Links */}
          {otherLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`text-sm font-bold font-inter transition-colors hover:text-[#8b6834] ${
                pathname === link.href ? "text-[#2c2419]" : "text-[#5d4e37]"
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
        <div className="absolute top-full left-0 right-0 bg-[#faf8f5] shadow-lg border-t-2 border-[#d4c4b0] z-50 md:hidden max-h-[80vh] overflow-y-auto">
          <div className="flex flex-col py-2 px-2">
            {cardCategories.map((category) => (
              <div key={category.name}>
                <div className="px-2 py-2 border-b border-[#d4c4b0]/30">
                  <p className="text-xs font-semibold text-[#8b6834] uppercase tracking-wide">
                    {category.name}
                  </p>
                </div>

                {category.cards.map((card) => (
                  <Link
                    key={card.id}
                    href={card.locked ? "#" : card.href}
                    onClick={(e) => {
                      if (card.locked) {
                        e.preventDefault();
                        if (isFreeUser) {
                          setUpgradeFeature(card.label);
                          setShowUpgradeModal(true);
                          setIsMobileMenuOpen(false);
                        }
                        return;
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-start gap-3 px-3 py-3 transition-colors ${
                      pathname === card.href
                        ? "text-[#2c2419] bg-[#e8dcc8]"
                        : card.locked
                          ? "text-[#5d4e37]/50"
                          : "text-[#5d4e37] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    <div
                      className={`mt-0.5 ${card.locked ? "text-[#8b6834]/30" : "text-[#8b6834]"}`}
                    >
                      {card.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold font-inter">
                          {card.label}
                        </p>
                        {card.locked && (
                          <Lock className="w-3 h-3 text-[#8b6834]/70" />
                        )}
                      </div>
                      <p
                        className={`text-xs ${
                          card.locked
                            ? "text-[#5d4e37]/40"
                            : "text-[#5d4e37]/70"
                        }`}
                      >
                        {card.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ))}

            {isFreeUser && (
              <div className="px-3 py-3 border-t border-[#d4c4b0]/30 bg-[#8b6834]/5 mt-2">
                <p className="text-xs text-[#5d4e37] mb-2">
                  Unlock all card types with premium
                </p>
                <button
                  onClick={() => {
                    setUpgradeFeature("All Premium Card Types");
                    setShowUpgradeModal(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-[#8b6834] text-[#faf8f5] text-xs font-semibold w-full"
                >
                  <Zap className="w-3 h-3" />
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Basic"
      />
    </nav>
  );
}
