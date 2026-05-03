"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import UpgradeModal from "../../components/UpgradeModal";
import CompactCreditDisplay from "../../components/CompactCreditDisplay";
import DashboardSidebar from "../../components/DashboardSidebar";
import { developerAPI } from "../../lib/api";
import { CARD_TYPES, CardDefinition, CardIconKey } from "../../lib/card-catalog";
import {
  ArrowRight,
  Calendar,
  ChefHat,
  Heart,
  HeartPulse,
  Image as ImageIcon,
  Key,
  Layers,
  Link as LinkIcon,
  Lock,
  Menu,
  Moon,
  Newspaper,
  Quote,
  Search,
  Users,
  X,
  Zap,
  LayoutGrid,
} from "lucide-react";

type DashboardCard = CardDefinition & {
  locked: boolean;
  icon: React.ReactNode;
};

type ApiKeyData = {
  apiKey?: string;
  usage?: number;
  limit?: number;
};

type IconElement = React.ReactElement<{ className?: string }>;

const cardIcons: Record<CardIconKey, React.ReactNode> = {
  news: <Newspaper className="w-6 h-6" />,
  url: <LinkIcon className="w-6 h-6" />,
  comment: <Quote className="w-6 h-6" />,
  recipe: <ChefHat className="w-6 h-6" />,
  followers: <Users className="w-6 h-6" />,
  health: <HeartPulse className="w-6 h-6" />,
  thumbnail: <ImageIcon className="w-6 h-6" />,
  islamic: <Moon className="w-6 h-6" />,
  wish: <Heart className="w-6 h-6" />,
};

function renderIcon(icon: React.ReactNode, className: string) {
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon as IconElement, { className });
  }

  return icon;
}

export default function Dashboard() {
  const { user, logout, credits } = useAuth();
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [apiKeyData, setApiKeyData] = useState<ApiKeyData>({});

  const isFreeUser = user?.plan !== "Premium";

  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        const data = await developerAPI.getApiKey();
        if (data.success) {
          setApiKeyData({
            apiKey: data.apiKey,
            usage: data.usage ?? 0,
            limit: data.limit ?? 20,
          });
        } else {
          setApiKeyData({});
        }
      } catch {
        setApiKeyData({});
      }
    };

    fetchApiInfo();
  }, []);

  const allCards: DashboardCard[] = useMemo(
    () =>
      CARD_TYPES.map((card) => ({
        ...card,
        locked: Boolean(card.requiresPro && isFreeUser),
        icon: cardIcons[card.iconKey],
      })),
    [isFreeUser],
  );

  const featuredCards = allCards.filter((card) => card.featured);
  const otherCards = allCards.filter((card) => !card.featured);

  const handleCardClick = (e: React.MouseEvent, card: DashboardCard) => {
    if (!card.locked) return;
    e.preventDefault();
    setUpgradeFeature(card.label);
    setShowUpgradeModal(true);
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#faf8f5] flex font-dm-sans selection:bg-[#8b6834] selection:text-white overflow-hidden">
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onUpgrade={(feature: string) => {
            setUpgradeFeature(feature);
            setShowUpgradeModal(true);
          }}
          user={user}
          logout={logout}
          isFreeUser={isFreeUser}
        />

        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          <header className="flex-shrink-0 h-14 lg:h-16 px-4 sm:px-6 lg:px-10 flex items-center justify-between border-b border-[#d4c4b0] bg-white z-30">
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
                    placeholder="Search recipe, followers, health, or tools..."
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

          <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-10 py-8 scroll-smooth">
            {showBanner && (
              <div className="relative overflow-hidden bg-[#2c2419] text-white px-6 md:px-8 py-5 mb-8 border-b border-[#8b6834]/40">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#8b6834]/10 blur-2xl translate-y-1/3 -translate-x-1/4" />

                <button
                  onClick={() => setShowBanner(false)}
                  className="absolute top-4 right-4 text-[#d4c4b0] hover:text-white transition-colors group"
                  title="Dismiss"
                >
                  <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pr-8">
                  <div className="shrink-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-lora font-semibold">
                      Welcome back, <span className="text-[#e8dcc8]">{user?.name?.split(" ")[0] || "Creator"}</span>👋
                    </h1>
                    <p className="text-[#d4c4b0] text-sm mt-1 opacity-80">
                      Pick a template and start creating instantly.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[#8b6834]/30 md:flex md:items-center md:gap-6 md:divide-x-0 border-t border-[#8b6834]/20 pt-3 md:border-0 md:pt-0">
                    <div className="flex items-center gap-1.5 md:gap-3 px-3 first:pl-0 md:px-0">
                      <div className="hidden md:flex w-9 h-9 bg-[#8b6834]/25 items-center justify-center text-[#e8dcc8] shrink-0">
                        <LayoutGrid className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-black text-white leading-none">
                          {credits?.total_cards_generated ?? 0}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4c4b0]/60 mt-0.5 leading-tight flex items-center gap-1">
                          <LayoutGrid className="w-2.5 h-2.5 md:hidden" />
                          Total
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block w-px h-9 bg-[#8b6834]/40 shrink-0" />

                    <div className="flex items-center gap-1.5 md:gap-3 px-3 md:px-0">
                      <div className="hidden md:flex w-9 h-9 bg-[#8b6834]/25 items-center justify-center text-[#e8dcc8] shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-2xl md:text-3xl font-black text-white leading-none">
                          {credits?.cards_generated_today ?? 0}
                        </p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4c4b0]/60 mt-0.5 leading-tight flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5 md:hidden" />
                          Today
                        </p>
                      </div>
                    </div>

                    <div className="hidden md:block w-px h-9 bg-[#8b6834]/40 shrink-0" />

                    <div className="flex items-center gap-1.5 md:gap-3 px-3 md:px-0">
                      <div className={`hidden md:flex w-9 h-9 items-center justify-center shrink-0 ${apiKeyData.apiKey ? "bg-emerald-900/50 text-emerald-300" : "bg-[#8b6834]/25 text-[#d4c4b0]/40"}`}>
                        <Key className="w-4 h-4" />
                      </div>
                      <div>
                        {apiKeyData.apiKey ? (
                          <>
                            <p className="text-2xl md:text-3xl font-black text-white leading-none">
                              {apiKeyData.usage ?? 0}
                              <span className="text-xs font-bold text-[#d4c4b0]/50">/{apiKeyData.limit ?? 20}</span>
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-400/70 mt-0.5 leading-tight flex items-center gap-1">
                              <Key className="w-2.5 h-2.5 md:hidden" />
                              API
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-base font-black text-[#d4c4b0]/40 uppercase tracking-tight leading-none">—</p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-[#d4c4b0]/40 mt-0.5 leading-tight flex items-center gap-1">
                              <Key className="w-2.5 h-2.5 md:hidden" />
                              API
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <section className="mb-14">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-[#2c2419] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-none bg-white border border-[#d4c4b0]/40 flex items-center justify-center text-[#5d4e37]">
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
                    className={`group relative overflow-hidden rounded-none border-2 transition-all duration-300 ease-out flex flex-col hover:-translate-y-1 ${card.locked ? "border-[#d4c4b0] bg-white/50 cursor-not-allowed" : "border-[#d4c4b0] bg-white hover:border-[#8b6834] shadow-none"}`}
                  >
                    {!card.locked && <div className="absolute inset-0 bg-gradient-to-br from-[#8b6834]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}

                    <div className="p-5 h-full flex flex-col relative z-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className={`p-3 rounded-none inline-flex transition-all duration-300 group-hover:scale-105 group-hover:rotate-2 ${card.locked ? "bg-[#f5f0e8] text-[#8b6834]/40" : "bg-[#2c2419] text-[#e8dcc8] group-hover:bg-[#8b6834] group-hover:text-white"}`}>
                          {renderIcon(card.icon, "w-5 h-5")}
                        </div>
                        {card.locked && (
                          <div className="bg-[#f5f0e8] px-2 py-1 rounded-none border border-[#d4c4b0]/40 flex items-center gap-1">
                            <Lock className="w-3 h-3 text-[#8b6834]/70" />
                            <span className="text-[10px] font-bold text-[#8b6834]/70">PRO</span>
                          </div>
                        )}
                      </div>

                      <h3 className={`text-lg font-bold font-inter mb-2 transition-colors ${card.locked ? "text-[#5d4e37]/60" : "text-[#2c2419] group-hover:text-[#8b6834]"}`}>
                        {card.label}
                      </h3>

                      <p className={`text-sm flex-grow font-medium leading-snug ${card.locked ? "text-[#5d4e37]/40" : "text-[#5d4e37]"}`}>
                        {card.description}
                      </p>

                      <div className={`mt-4 flex items-center font-bold text-xs tracking-wide transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 ${card.locked ? "text-[#8b6834]" : "text-[#8b6834]"}`}>
                        <span className="flex items-center gap-1.5">
                          {card.locked ? "Upgrade" : "Start"} <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl tracking-tight font-bold text-[#2c2419] flex items-center gap-3">
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
                    className={`group flex items-center gap-3 p-3.5 rounded-none transition-all duration-300 hover:bg-[#f5f0e8]/30 border-[1.5px] ${card.locked ? "bg-white/50 border-[#d4c4b0]/60 cursor-not-allowed" : "bg-white border-[#d4c4b0] hover:border-[#8b6834]/60"}`}
                  >
                    <div className={`transition-transform duration-300 flex-shrink-0 ${card.locked ? "text-[#8b6834]/30" : "text-[#8b6834]"}`}>
                      {renderIcon(card.icon, "w-6 h-6")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h4 className={`text-[13px] font-black font-inter truncate transition-colors uppercase tracking-tight ${card.locked ? "text-[#5d4e37]/50" : "text-[#2c2419] group-hover:text-[#8b6834]"}`}>
                          {card.label}
                        </h4>
                        {card.locked && <Lock className="w-3 h-3 text-[#8b6834]/60 flex-shrink-0" />}
                      </div>
                      <p className={`text-[11px] leading-snug font-medium line-clamp-1 ${card.locked ? "text-[#5d4e37]/40" : "text-[#5d4e37]/80"}`}>
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
