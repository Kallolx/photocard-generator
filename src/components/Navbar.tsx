"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  ChevronLeft,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Lock,
  Link as LinkIcon,
  Moon,
  Heart,
  Image as ImageIcon,
  Quote,
  Scissors,
  LayoutGrid,
  Languages,
  Newspaper,
  ChefHat,
  Users,
  HeartPulse,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CompactCreditDisplay from "./CompactCreditDisplay";
import UpgradeModal from "./UpgradeModal";
import { CARD_TYPES, CardIconKey } from "@/lib/card-catalog";

type CardType = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  locked: boolean;
  description: string;
  featured?: boolean;
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

  const cardIconMap: Record<CardIconKey, React.ReactNode> = {
    news: <Newspaper className="w-4 h-4" />,
    url: <LinkIcon className="w-4 h-4" />,
    comment: <Quote className="w-4 h-4" />,
    recipe: <ChefHat className="w-4 h-4" />,
    followers: <Users className="w-4 h-4" />,
    health: <HeartPulse className="w-4 h-4" />,
    thumbnail: <ImageIcon className="w-4 h-4" />,
    islamic: <Moon className="w-4 h-4" />,
    wish: <Heart className="w-4 h-4" />,
  };

  const allCards = CARD_TYPES.map((card) => ({
    ...card,
    icon: cardIconMap[card.iconKey],
    locked: card.requiresPro ? isFreeUser : false,
    featured: card.featured,
  }));

  const primaryOrder = ["news", "url", "comment", "thumbnail"];
  const disabledCardIds = ["followers", "health", "recipe"];
  const orderedCards = [
    ...primaryOrder.flatMap((id) => {
      const match = allCards.find((card) => card.id === id);
      return match ? [match] : [];
    }),
    ...allCards.filter((card) => !primaryOrder.includes(card.id)),
  ].map((card) => ({
    ...card,
    locked: card.locked || disabledCardIds.includes(card.id),
  }));

  const isOnCardType = allCards.some((card) => card.href === pathname);

  const otherLinks = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutGrid className="w-4 h-4" /> },
    { label: "Background Remover", href: "/background-remover", icon: <Scissors className="w-4 h-4" />, locked: isFreeUser },
  ];

  return (
    <nav className="w-full bg-[#faf8f5] border-b-2 border-[#d4c4b0] px-4 md:px-6 py-3 md:py-4 relative z-[100]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/dashboard"
            className="p-2 text-[#5d4e37] hover:text-[#8b6834] rounded-none transition-colors"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>

          <Link href="/dashboard" className="inline-block">
            <Image
              src="/images/logo.png"
              alt="PhotoCard logo"
              width={160}
              height={36}
              className="object-contain h-11"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6 min-w-0">
          <div className="relative">
            <button
              onClick={() => setIsCardsMenuOpen((value) => !value)}
              onMouseEnter={() => setIsCardsMenuOpen(true)}
              className={`flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#8b6834] ${isOnCardType ? "text-[#2c2419]" : "text-[#5d4e37]"}`}
            >
              <span>CARD TYPES</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCardsMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isCardsMenuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsCardsMenuOpen(false)} />
                <div
                  className="absolute left-0 top-full mt-3 w-[640px] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-[#d4c4b0] p-2 z-40 overflow-hidden"
                  onMouseLeave={() => setIsCardsMenuOpen(false)}
                >
                  <div className="grid grid-flow-col auto-cols-fr grid-rows-3 gap-0 overflow-hidden rounded-md border border-[#d4c4b0]/70 bg-white">
                    {orderedCards.map((card, cardIndex) => {
                      const rows = 3;
                      const columns = Math.ceil(orderedCards.length / rows);
                      const columnIndex = Math.floor(cardIndex / rows);
                      const rowIndex = cardIndex % rows;
                      const isLastColumn = columnIndex === columns - 1;
                      const isLastRow = rowIndex === rows - 1;
                      const isActive = pathname === card.href;

                      return (
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
                          className={`flex h-9 items-center gap-2 px-2.5 text-xs font-bold transition-colors ${isActive ? "bg-[#8b6834] text-white" : card.locked ? "text-[#b49e82] hover:bg-[#faf8f5] hover:text-[#5d4e37]" : "text-[#2c2419] hover:bg-[#faf8f5] hover:text-[#8b6834]"} ${!isLastColumn ? "border-r border-[#d4c4b0]/60" : ""} ${!isLastRow ? "border-b border-[#d4c4b0]/60" : ""}`}
                        >
                          <span className={`shrink-0 ${isActive ? "text-white/90" : card.locked ? "text-[#cbb89f]" : "text-[#8b6834]"}`}>
                            {React.cloneElement(card.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                          </span>
                          <span className="truncate leading-none">{card.label}</span>
                          {card.locked && <Lock className="ml-auto h-3 w-3 shrink-0 text-current" />}
                        </Link>
                      );
                    })}
                  </div>

                  {isFreeUser && (
                    <div className="mt-2 flex items-center justify-between gap-4 rounded-xl border border-[#d4c4b0]/70 bg-[#faf8f5] px-3 py-2">
                      <div>
                        <p className="text-xs font-bold text-[#2c2419] mb-0.5">Want access to all card types?</p>
                        <p className="text-[11px] text-[#5d4e37]">Upgrade to unlock every premium format.</p>
                      </div>
                      <button
                        onClick={() => {
                          setUpgradeFeature("All Premium Card Types");
                          setShowUpgradeModal(true);
                          setIsCardsMenuOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#8b6834] text-[#faf8f5] text-xs font-bold hover:bg-[#2c2419] transition-colors whitespace-nowrap"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        Upgrade Now
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {otherLinks.map((link) => (
            <Link
              key={link.label}
              href={link.locked ? "#" : link.href}
              onClick={(e) => {
                if (link.locked) {
                  e.preventDefault();
                  setUpgradeFeature(link.label);
                  setShowUpgradeModal(true);
                }
              }}
              className={`flex items-center gap-1 text-sm font-bold transition-colors hover:text-[#8b6834] ${
                pathname === link.href ? "text-[#2c2419]" : link.locked ? "text-[#5d4e37]/50" : "text-[#5d4e37]"
              }`}
            >
              {link.label}
              {link.locked && <Lock className="w-3 h-3 text-[#8b6834]/60" />}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:block">
            <CompactCreditDisplay />
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen((value) => !value)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-[#f5f0e8] transition-colors border border-transparent hover:border-[#d4c4b0]/50"
            >
              <div className="w-8 h-8 bg-[#d4c4b0] rounded-full flex items-center justify-center text-[#2c2419] font-bold text-sm border-2 border-[#faf8f5] shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#5d4e37] transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#faf8f5] rounded-lg shadow-xl border border-[#d4c4b0] py-1 z-40 overflow-hidden ring-1 ring-black/5">
                  <div className="px-4 py-3 border-b border-[#d4c4b0]/30 bg-[#f5f0e8]/30">
                    <p className="text-sm font-bold text-[#2c2419] truncate">{user?.name}</p>
                    <p className="text-xs text-[#5d4e37] truncate">{user?.email}</p>
                    <div className="mt-2 text-xs font-semibold text-[#8b6834] bg-[#8b6834]/10 px-2 py-0.5 rounded-full inline-block">
                      {user?.plan || "Free"} Plan
                    </div>
                  </div>

                  <div className="py-1">
                    <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors">
                      <Settings className="w-4 h-4 mr-3 text-[#8b6834]" />
                      Settings
                    </Link>

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

          <button
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            className="md:hidden p-2 text-[#5d4e37] hover:text-[#8b6834] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#faf8f5] shadow-lg border-t-2 border-[#d4c4b0] z-50 md:hidden max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 gap-1 p-2">
            {orderedCards.map((card) => (
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
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors ${pathname === card.href ? "text-[#2c2419] bg-[#e8dcc8]" : card.locked ? "text-[#5d4e37]/50" : "text-[#5d4e37] hover:bg-[#f5f0e8]"}`}
              >
                <div className={`shrink-0 ${card.locked ? "text-[#8b6834]/30" : "text-[#8b6834]"}`}>
                  {React.cloneElement(card.icon as React.ReactElement<any>, { className: "w-4 h-4" })}
                </div>
                <span className="min-w-0 truncate font-inter">{card.label}</span>
                {card.locked && <Lock className="ml-auto w-3 h-3 text-[#8b6834]/70" />}
              </Link>
            ))}

            <div className="space-y-1 mt-3 border-t border-[#d4c4b0]/30 pt-3">
              {otherLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.locked ? "#" : link.href}
                  onClick={(e) => {
                    if (link.locked) {
                      e.preventDefault();
                      setUpgradeFeature(link.label);
                      setShowUpgradeModal(true);
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-semibold transition-colors ${
                    pathname === link.href ? "text-[#2c2419] bg-[#e8dcc8]" : link.locked ? "text-[#5d4e37]/50" : "text-[#5d4e37] hover:bg-[#f5f0e8]"
                  }`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>

            {isFreeUser && (
              <div className="px-3 py-3 border-t border-[#d4c4b0]/30 bg-[#8b6834]/5 mt-2">
                <p className="text-xs text-[#5d4e37] mb-2">Unlock all card types with premium</p>
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