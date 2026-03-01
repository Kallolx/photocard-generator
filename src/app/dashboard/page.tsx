"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  ArrowRight,
  Menu,
  X,
  Settings,
  LogOut,
  User,
  Zap,
  LayoutDashboard,
  Layers,
  HelpCircle,
  Scissors,
  LayoutGrid,
  Languages,
  Newspaper,
  Search,
  ChevronDown,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UpgradeModal from "@/components/UpgradeModal";
import CompactCreditDisplay from "@/components/CompactCreditDisplay";

type CardType = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  locked: boolean;
  description: string;
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [cardTypesOpen, setCardTypesOpen] = useState(false);
  const pathname = usePathname();

  const isFreeUser = user?.plan === "Free";

  // Check hydration to avoid class mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const allCards: CardType[] = [
    {
      id: "news",
      label: "Today's News",
      href: "/news",
      icon: <Newspaper className="w-6 h-6" />,
      locked: isFreeUser,
      description: "Browse latest news and generate cards instantly",
    },
    {
      id: "url",
      label: "URL Newscard",
      href: "/url",
      icon: <LinkIcon className="w-6 h-6" />,
      locked: false,
      description: "Convert URLs to beautiful newscards instantly",
    },
    {
      id: "custom",
      label: "Custom card",
      href: "/custom",
      icon: <Edit className="w-6 h-6" />,
      locked: isFreeUser,
      description: "Design custom cards from scratch with full control",
    },
    {
      id: "comment",
      label: "Comment/Quote",
      href: "/comment",
      icon: <Quote className="w-6 h-6" />,
      locked: isFreeUser,
      description: "Turn social media comments into aesthetic quote cards",
    },
    {
      id: "poll",
      label: "Poll Card",
      href: "/poll",
      icon: <BarChart3 className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Interactive poll cards",
    },
    {
      id: "compare",
      label: "Compare Card",
      href: "/compare",
      icon: <GitCompare className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Compare products or services",
    },
    {
      id: "marketing",
      label: "Marketing Card",
      href: "/marketing",
      icon: <Megaphone className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Promotional & ads cards",
    },
    {
      id: "realestate",
      label: "Real Estate Card",
      href: "/realestate",
      icon: <Home className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Property listings & tours",
    },
    {
      id: "thumbnail",
      label: "Thumbnail Card",
      href: "/thumbnail",
      icon: <ImageIcon className="w-5 h-5" />,
      locked: isFreeUser,
      description: "YouTube & video thumbnails",
    },
    {
      id: "info",
      label: "Info Card",
      href: "/info",
      icon: <FileText className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Information display cards",
    },
    {
      id: "islamic",
      label: "Islamic Card",
      href: "/islamic",
      icon: <Moon className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Islamic quotes & greetings",
    },
    {
      id: "wish",
      label: "Wish Card",
      href: "/wish",
      icon: <Heart className="w-5 h-5" />,
      locked: isFreeUser,
      description: "Birthday & celebration wishes",
    },
  ];

  const featuredCardIds = ["url", "news", "custom", "comment"];
  const featuredCards = allCards.filter((card) =>
    featuredCardIds.includes(card.id),
  );
  const otherCards = allCards.filter(
    (card) => !featuredCardIds.includes(card.id),
  );

  // Card categories mirroring the Navbar
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

  // Additional tools for sidebar
  const otherTools = [
    {
      label: "Background Remover",
      href: "/background-remover",
      icon: <Scissors className="w-5 h-5" />,
    },
    {
      label: "Collage Maker",
      href: "/collage",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      label: "Bangla Converter",
      href: "/bangla-converter",
      icon: <Languages className="w-5 h-5" />,
    },
  ];

  const handleCardClick = (e: React.MouseEvent, card: CardType) => {
    if (card.locked) {
      e.preventDefault();
      if (isFreeUser) {
        setUpgradeFeature(card.label);
        setShowUpgradeModal(true);
      }
    }
  };

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
    <ProtectedRoute>
      <div className="h-screen bg-[#faf8f5] flex font-dm-sans selection:bg-[#8b6834] selection:text-white overflow-hidden">
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
                    setUpgradeFeature("Today's News Feed");
                    setShowUpgradeModal(true);
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
                  <div className="ml-4 border-l border-[#d4c4b0]/60 pl-3 pb-1 space-y-4 mt-1">
                    {cardCategories.map((cat) => (
                      <div key={cat.name}>
                        <p className="px-2 py-1 text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          {cat.name}
                        </p>
                        {cat.cards.map((card) => (
                          <Link
                            key={card.id}
                            href={card.locked ? "#" : card.href}
                            onClick={(e) => {
                              if (card.locked) {
                                e.preventDefault();
                                setUpgradeFeature(card.label);
                                setShowUpgradeModal(true);
                              }
                            }}
                            className={`flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-none transition-all ${
                              pathname === card.href
                                ? "bg-[#8b6834] text-white"
                                : card.locked
                                  ? "text-[#5d4e37]/50"
                                  : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {card.icon}
                              {card.label}
                            </span>
                            {card.locked && <Lock className="w-3 h-3 shrink-0" />}
                          </Link>
                        ))}
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
                  onClick={() => {
                    setUpgradeFeature("Premium Features");
                    setShowUpgradeModal(true);
                  }}
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
                  <p className="text-xs text-[#5d4e37] truncate">
                    {user?.email}
                  </p>
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

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Top Header */}
          <header className="flex-shrink-0 h-20 lg:h-24 px-4 sm:px-6 lg:px-10 flex items-center justify-between border-b border-[#d4c4b0] bg-white z-30">
            <div className="flex items-center gap-6 flex-1">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2.5 bg-[#f5f0e8] border border-[#d4c4b0] rounded-none text-[#5d4e37] hover:text-[#8b6834] transition-all"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="hidden md:flex flex-col">
                <h2 className="text-xl font-black text-[#2c2419] tracking-tight uppercase">
                  Dashboard
                </h2>
              </div>

              <div className="hidden lg:flex items-center flex-1 max-w-md ml-8">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b49e82]" />
                  <input
                    type="text"
                    placeholder="Search templates or tools..."
                    className="w-full h-11 bg-[#f5f0e8]/50 border-2 border-[#d4c4b0]/40 rounded-none px-12 text-sm font-medium focus:outline-none focus:border-[#8b6834]/30 transition-all placeholder:text-[#b49e82]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <CompactCreditDisplay />

              {isFreeUser && (
                <button
                  onClick={() => {
                    setUpgradeFeature("Premium Features");
                    setShowUpgradeModal(true);
                  }}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#8b6834] text-white text-[11px] font-black uppercase tracking-widest rounded-none hover:bg-[#2c2419] transition-all border-2 border-[#8b6834] hover:border-[#2c2419]"
                >
                  <Zap className="w-3.5 h-3.5" />
                  Upgrade
                </button>
              )}
            </div>
          </header>

          {/* Main Content Scrollable Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-10 py-8 scroll-smooth">
            {/* Welcome Banner */}
            {showBanner && (
              <div className="relative overflow-hidden rounded-none bg-[#2c2419] text-white p-8 md:p-10 mb-10 border-b-4 border-[#8b6834]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-none blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#8b6834] opacity-10 rounded-none blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <button
                  onClick={() => setShowBanner(false)}
                  className="absolute top-6 right-6 p-2 text-[#d4c4b0] hover:text-white transition-colors z-20 group"
                  title="Dismiss banner"
                >
                  <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="relative z-10">
                  <h1 className="text-3xl md:text-4xl font-lora font-bold mb-4">
                    Welcome back,{" "}
                    <span className="text-[#e8dcc8]">
                      {user?.name?.split(" ")[0] || "Admin"}
                    </span>{" "}
                    👋
                  </h1>
                  <p className="text-[#d4c4b0] text-sm md:text-base max-w-2xl font-medium leading-relaxed opacity-90">
                    Ready to craft something amazing? Select a template below to
                    start generating beautiful social cards instantly. Use our
                    AI tools to speed up your workflow.
                  </p>
                </div>
              </div>
            )}

            {/* Featured Tools Grid */}
            <section className="mb-14">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-[#2c2419] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-[#8b6834]/10 flex items-center justify-center text-[#8b6834]">
                    <Zap className="w-5 h-5" />
                  </div>
                  Popular Actions
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredCards.map((card) => (
                  <Link
                    href={card.locked ? "#" : card.href}
                    key={card.id}
                    onClick={(e) => handleCardClick(e, card)}
                    className={`group relative overflow-hidden rounded-none border-2 transition-all duration-300 ease-out flex flex-col hover:-translate-y-1
                      ${
                        card.locked
                          ? "border-[#d4c4b0] bg-white/50 cursor-not-allowed"
                          : "border-[#d4c4b0] bg-white hover:border-[#8b6834] shadow-none"
                      }`}
                  >
                    {/* Background glow effect on hover */}
                    {!card.locked && (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#8b6834]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}

                    <div className="p-5 h-full flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-none inline-flex transition-all duration-300 group-hover:scale-105 group-hover:rotate-2
                          ${card.locked ? "bg-[#f5f0e8] text-[#8b6834]/40" : "bg-[#2c2419] text-[#e8dcc8] group-hover:bg-[#8b6834] group-hover:text-white"}`}
                        >
                          {React.cloneElement(
                            card.icon as React.ReactElement<any>,
                            { className: "w-5 h-5" },
                          )}
                        </div>
                        {card.locked && (
                          <div className="bg-[#f5f0e8] px-2 py-1 rounded-none border border-[#d4c4b0]/40 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#8b6834]/70" />
                            <span className="text-[10px] font-bold text-[#8b6834]/70">
                              PRO
                            </span>
                          </div>
                        )}
                      </div>

                      <h3
                        className={`text-lg font-bold font-inter mb-2 transition-colors
                        ${card.locked ? "text-[#5d4e37]/60" : "text-[#2c2419] group-hover:text-[#8b6834]"}`}
                      >
                        {card.label}
                      </h3>

                      <p
                        className={`text-sm flex-grow font-medium leading-snug
                        ${card.locked ? "text-[#5d4e37]/40" : "text-[#5d4e37]"}`}
                      >
                        {card.description}
                      </p>

                      <div
                        className={`mt-4 flex items-center font-bold text-xs tracking-wide transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100
                        ${card.locked ? "text-[#8b6834]" : "text-[#8b6834]"}`}
                      >
                        {card.locked ? (
                          <span className="flex items-center gap-1.5">
                            Upgrade <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            Start <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Other Card Types */}
            <section className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-[#2c2419] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-white border border-[#d4c4b0]/40 flex items-center justify-center text-[#5d4e37]">
                    <Layers className="w-5 h-5" />
                  </div>
                  More Templates
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {otherCards.map((card) => (
                  <Link
                    href={card.locked ? "#" : card.href}
                    key={card.id}
                    onClick={(e) => handleCardClick(e, card)}
                    className={`group flex items-center gap-3 p-3.5 rounded-none transition-all duration-300 hover:bg-[#f5f0e8]/30 border-[1.5px]
                      ${
                        card.locked
                          ? "bg-white/50 border-[#d4c4b0]/60 cursor-not-allowed"
                          : "bg-white border-[#d4c4b0] hover:border-[#8b6834]/60"
                      }`}
                  >
                    <div
                      className={`transition-transform duration-300 flex-shrink-0
                      ${card.locked ? "text-[#8b6834]/30" : "text-[#8b6834]"}`}
                    >
                      {React.cloneElement(
                        card.icon as React.ReactElement<any>,
                        {
                          className: "w-6 h-6",
                        },
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4
                          className={`text-[13px] font-black font-inter truncate transition-colors uppercase tracking-tight
                          ${card.locked ? "text-[#5d4e37]/50" : "text-[#2c2419] group-hover:text-[#8b6834]"}`}
                        >
                          {card.label}
                        </h4>
                        {card.locked && (
                          <Lock className="w-3 h-3 text-[#8b6834]/60 flex-shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] leading-snug font-medium line-clamp-1
                        ${card.locked ? "text-[#5d4e37]/40" : "text-[#5d4e37]/80"}`}
                      >
                        {card.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Premium"
      />
    </ProtectedRoute>
  );
}
