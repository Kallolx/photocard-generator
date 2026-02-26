"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Settings,
  LogOut,
  LayoutDashboard,
  HelpCircle,
  Scissors,
  LayoutGrid,
  Languages,
  ArrowLeft,
  Rss,
  Newspaper,
  CalendarClock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe2,
  Clock,
  Sparkles,
  Filter,
  Search,
  ChevronLeft,
  Lock,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UpgradeModal from "@/components/UpgradeModal";
import CompactCreditDisplay from "@/components/CompactCreditDisplay";
import { formatDistanceToNow, parseISO } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet: string;
  imageUrl?: string;
  faviconUrl?: string;
  category?: string;
}

interface NewsStats {
  total: number;
  sources: number;
  lastUpdated: string;
}

const NewsImage = ({
  initialImageUrl,
  url,
  sourceName,
}: {
  initialImageUrl?: string;
  url: string;
  sourceName: string;
}) => {
  const [imgSrc, setImgSrc] = useState(initialImageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // If the image is a fallback favicon or is missing entirely, try fetching OG image from our API.
    const isFavicon = initialImageUrl?.includes("favicons");
    if (initialImageUrl && !isFavicon) return;

    let isMounted = true;
    const fetchOg = async () => {
      try {
        const res = await fetch("/api/extract-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const data = await res.json();
        if (data.image && isMounted) {
          setImgSrc(data.image);
        } else if (data.logo && isMounted) {
          setImgSrc(data.logo);
        }
      } catch (err) {}
    };

    // Stagger OG fetching so we don't bombard our own API instantly upon page pagination
    const timer = setTimeout(
      () => {
        fetchOg();
      },
      Math.random() * 800 + 400,
    );

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [url, initialImageUrl]);

  if (hasError || !imgSrc) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-[#d4c4b0] bg-white/50 backdrop-blur-sm">
        <Newspaper className="w-12 h-12 opacity-30 animate-pulse" />
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={sourceName}
      loading="lazy"
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      onError={(e) => {
        setHasError(true);
      }}
    />
  );
};

export default function NewsPage() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const isFreeUser = user?.plan === "Free";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 24;

  // Active theme menu state (stores the ID of the card whose menu is open)
  const [activeThemeMenu, setActiveThemeMenu] = useState<string | null>(null);

  // Helper for dynamically setting fonts
  const isBangla = (text: string) => {
    // Basic regex to check for Bengali Unicode range
    return /[\u0980-\u09FF]/.test(text);
  };

  const getFontClass = (text: string) => {
    return isBangla(text) ? "font-noto-bengali" : "font-dm-sans";
  };

  const fetchNews = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from cache if not forcing refresh
      if (!forceRefresh) {
        const cachedStr = sessionStorage.getItem("cachedNewsData");
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            // Use cache if less than 5 minutes old
            if (Date.now() - cached.timestamp < 5 * 60 * 1000) {
              setNews(cached.news);
              setStats(cached.stats);
              setIsLoading(false);
              return;
            }
          } catch (e) {}
        }
      }

      // Add a slight artificial delay so the beautiful loader is visible
      const [res] = await Promise.all([
        fetch("/api/news"),
        new Promise((r) => setTimeout(r, 800)),
      ]);

      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();
      if (data.success) {
        setNews(data.data);
        setStats(data.stats);
        sessionStorage.setItem(
          "cachedNewsData",
          JSON.stringify({
            timestamp: Date.now(),
            news: data.data,
            stats: data.stats,
          }),
        );
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong fetching the news.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

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

  const handleGenerateClick = (link: string, theme: string) => {
    // Navigate to /url and pass the link as a query parameter or localStorage
    // Using sessionStorage is cleaner for a temporary passing of state
    sessionStorage.setItem("pendingUrlGeneration", link);
    sessionStorage.setItem("pendingThemeGeneration", theme);
    setActiveThemeMenu(null); // close menu
    router.push("/url?auto=true");
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
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium ${
        isActive
          ? "bg-[#8b6834] text-white shadow-md shadow-[#8b6834]/20"
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

  // Apply Filters to News
  const filteredNews = news.filter((item) => {
    const matchesSource =
      selectedSource === "All" || item.source === selectedSource;
    const matchesCategory =
      selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSource && matchesCategory && matchesSearch;
  });

  // Calculate Pagination Data
  const totalItems = filteredNews.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredNews.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Pagination Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Skeleton Loader Component
  const LoaderGrid = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-[#d4c4b0]/30 shadow-sm overflow-hidden flex flex-col h-[400px] animate-pulse"
          >
            <div className="h-48 bg-[#d4c4b0]/20 w-full" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-24 bg-[#d4c4b0]/30 rounded-full" />
                <div className="h-4 w-16 bg-[#d4c4b0]/20 rounded-md" />
              </div>
              <div className="space-y-3 mb-4">
                <div className="h-6 bg-[#d4c4b0]/40 rounded-md w-full" />
                <div className="h-6 bg-[#d4c4b0]/40 rounded-md w-4/5" />
              </div>
              <div className="mt-auto h-12 bg-[#d4c4b0]/20 rounded-xl w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Available unique sources and categories for filter
  const uniqueSources = Array.from(
    new Set(news.map((item) => item.source)),
  ).sort();

  const uniqueCategories = Array.from(
    new Set(news.map((item) => item.category || "General")),
  ).sort();

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
          {/* Sidebar Header */}
          <div className="h-20 flex items-center px-6 border-b border-[#d4c4b0]/30 shadow-sm relative">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b6834] to-[#5d4e37] flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-xl font-lora font-bold text-[#2c2419] tracking-tight group-hover:text-[#8b6834] transition-colors">
                Socialcard
              </span>
            </Link>
            <button
              className="lg:hidden absolute right-4 p-2 text-[#5d4e37] hover:bg-[#f5f0e8] rounded-full transition-colors"
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
              />
              <NavItem
                href="/news"
                icon={<Newspaper className="w-5 h-5" />}
                label="Today's News"
                isActive={true}
                locked={isFreeUser}
                onClick={(e) => {
                  if (isFreeUser) {
                    e.preventDefault();
                    setUpgradeFeature("Today's News Feed");
                    setShowUpgradeModal(true);
                  }
                }}
              />
              <NavItem
                href="/settings"
                icon={<Settings className="w-5 h-5" />}
                label="Settings"
              />
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
                />
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-[#d4c4b0]/40 bg-[#faf8f5]/50">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white border border-[#d4c4b0]/40 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#e8dcc8] flex items-center justify-center text-[#8b6834] font-bold border-2 border-white shadow-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#2c2419] truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-[#5d4e37] truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                window.location.href = "/";
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-red-600 hover:text-white hover:bg-red-500 rounded-xl transition-all border border-red-200 hover:border-red-500"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {isFreeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#faf8f5]/50 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center text-[#8b6834] mb-8 animate-bounce">
                <Lock className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-lora font-bold text-[#2c2419] mb-4">
                Today's News is a Premium Feature
              </h1>
              <p className="text-[#5d4e37] max-w-md mb-8 leading-relaxed">
                Stay ahead of the competition with real-time news feeds from top
                sources. Generate professional newscards from the latest
                headlines in seconds.
              </p>
              <button
                onClick={() => {
                  setUpgradeFeature("Today's News Feed");
                  setShowUpgradeModal(true);
                }}
                className="px-8 py-4 bg-[#8b6834] text-white font-bold rounded-2xl shadow-lg shadow-[#8b6834]/30 hover:bg-[#5d4e37] transform hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <>
              {/* Top Header */}
              <header className="flex-shrink-0 h-20 lg:h-24 px-4 sm:px-6 lg:px-10 flex items-center justify-between border-b border-[#d4c4b0]/20 bg-[#faf8f5]/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden p-2.5 bg-white border border-[#d4c4b0]/50 rounded-xl text-[#5d4e37] hover:text-[#8b6834] hover:border-[#8b6834]/50 shadow-sm transition-all"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#8b6834] transition-colors border border-transparent hover:border-[#d4c4b0]/50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-semibold">Back</span>
                  </Link>
                  <div className="hidden md:block h-6 w-px bg-[#d4c4b0]/50 mx-2"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#8b6834]/10 flex items-center justify-center text-[#8b6834]">
                      <Rss className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2c2419] leading-none">
                        News Feed
                      </h2>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <CompactCreditDisplay />
                </div>
              </header>

              {/* Main Content Scrollable Area */}
              <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-10 py-8 scroll-smooth">
                {/* Stats Overview */}
                {!isLoading && !error && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white rounded-2xl p-6 border border-[#d4c4b0]/40 shadow-sm flex items-center gap-5 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[#8b6834]/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#5d4e37] uppercase tracking-wide">
                          Total Articles Today
                        </h3>
                        <p className="text-3xl font-inter font-black text-[#2c2419]">
                          {stats.total}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#d4c4b0]/40 shadow-sm flex items-center gap-5 relative overflow-hidden">
                      <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0">
                        <Globe2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#5d4e37] uppercase tracking-wide">
                          Active Sources
                        </h3>
                        <p className="text-3xl font-inter font-black text-[#2c2419]">
                          {stats.sources}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#d4c4b0]/40 shadow-sm flex items-center gap-5 relative overflow-hidden">
                      <div className="w-14 h-14 rounded-full bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#5d4e37] uppercase tracking-wide">
                          Last Updated
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-inter font-bold text-[#2c2419]">
                            {new Date(stats.lastUpdated).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                          <button
                            onClick={() => fetchNews(true)}
                            className="p-1 bg-[#f5f0e8] hover:bg-[#8b6834] text-[#8b6834] hover:text-white rounded-md transition-colors shadow-sm"
                            title="Refresh Feed"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-[#5d4e37] mt-1">Live Feed</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-2xl mb-8 flex flex-col items-center text-center">
                    <Globe2 className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-bold mb-2">
                      Failed to load news feed
                    </h3>
                    <p className="text-sm max-w-md">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-6 px-6 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Filter Controls */}
                {!isLoading && !error && news.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-[#d4c4b0]/40 shadow-sm">
                    <div className="relative w-full sm:w-auto flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5d4e37]" />
                      <input
                        type="text"
                        placeholder="Search news..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1); // Reset to page 1 on search
                        }}
                        className="w-full pl-9 pr-4 py-2 bg-[#f5f0e8] text-[#2c2419] border-none rounded-lg text-sm font-medium focus:ring-2 focus:ring-[#8b6834] focus:outline-none transition-all placeholder:text-[#5d4e37]/60"
                      />
                    </div>

                    <div className="relative w-full sm:w-[220px] flex items-center">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Filter className="w-4 h-4 text-[#8b6834]" />
                      </div>
                      <select
                        value={selectedSource}
                        onChange={(e) => {
                          setSelectedSource(e.target.value);
                          setCurrentPage(1); // Reset to page 1 on filter
                        }}
                        className="w-full bg-[#f5f0e8] border border-[#d4c4b0]/50 text-[#2c2419] text-sm font-bold rounded-xl py-2 pl-9 pr-10 focus:ring-2 focus:ring-[#8b6834] focus:border-transparent outline-none appearance-none cursor-pointer shadow-sm hover:border-[#8b6834]/50 transition-colors"
                      >
                        <option value="All">All Sources</option>
                        {uniqueSources.map((source) => (
                          <option key={source} value={source}>
                            {source}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-[#8b6834]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    <div className="relative w-full sm:w-[200px] flex items-center">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <LayoutGrid className="w-4 h-4 text-[#8b6834]" />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => {
                          setSelectedCategory(e.target.value);
                          setCurrentPage(1); // Reset to page 1 on filter
                        }}
                        className="w-full bg-[#f5f0e8] border border-[#d4c4b0]/50 text-[#2c2419] text-sm font-bold rounded-xl py-2 pl-9 pr-10 focus:ring-2 focus:ring-[#8b6834] focus:border-transparent outline-none appearance-none cursor-pointer shadow-sm hover:border-[#8b6834]/50 transition-colors"
                      >
                        <option value="All">All Categories</option>
                        {uniqueCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                          className="w-4 h-4 text-[#8b6834]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading State or Feed Layout */}
                {isLoading ? (
                  <div className="pt-4">
                    <div className="flex items-center justify-center mb-10 gap-3 text-[#8b6834]">
                      <Rss className="w-5 h-5 animate-pulse" />
                      <h3 className="text-xl font-lora font-bold animate-pulse">
                        Gathering the latest headlines...
                      </h3>
                    </div>
                    <LoaderGrid />
                  </div>
                ) : (
                  !error && (
                    <div className="space-y-8">
                      {currentItems.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-[#d4c4b0]/40">
                          <Newspaper className="w-12 h-12 text-[#d4c4b0] mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-[#2c2419]">
                            No news found
                          </h3>
                          <p className="text-[#5d4e37] text-sm">
                            Try adjusting your filters or search query.
                          </p>
                          <button
                            onClick={() => {
                              setSearchQuery("");
                              setSelectedSource("All");
                            }}
                            className="mt-4 text-[#8b6834] font-bold text-sm hover:underline"
                          >
                            Clear Filters
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-4 mb-4 py-3 z-10 w-full">
                            <h2 className="text-xl font-bold text-[#2c2419]">
                              Today's News
                            </h2>
                            <div className="flex-1 h-px bg-[#d4c4b0]/40"></div>
                            <span className="text-sm font-bold text-[#5d4e37]">
                              Showing {startIndex + 1}-
                              {Math.min(
                                startIndex + ITEMS_PER_PAGE,
                                totalItems,
                              )}{" "}
                              of {totalItems}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {currentItems.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white rounded-2xl border border-[#d4c4b0]/40 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group h-full"
                              >
                                {/* Image Header */}
                                <div className="h-48 relative overflow-hidden bg-[#f5f0e8]">
                                  <NewsImage
                                    initialImageUrl={item.imageUrl}
                                    url={item.link}
                                    sourceName={item.source}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none">
                                    <div className="flex items-center gap-2 bg-[#8b6834] px-2.5 py-1 rounded shadow-lg pointer-events-auto">
                                      {item.faviconUrl && (
                                        <img
                                          src={item.faviconUrl}
                                          alt={`${item.source} icon`}
                                          className="w-3 h-3 rounded-sm object-contain bg-white/20"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                          }}
                                        />
                                      )}
                                      <span
                                        className={`text-white text-[10px] font-bold uppercase tracking-wider ${getFontClass(item.source)}`}
                                      >
                                        {item.source}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Content Body */}
                                <div className="p-5 flex flex-col flex-grow relative">
                                  <div className="flex items-center gap-2 text-[#5d4e37] text-xs font-semibold mb-3">
                                    <CalendarClock className="w-3.5 h-3.5" />
                                    <span>
                                      {(() => {
                                        try {
                                          // First try to parse as ISO date, if successful compute relative time
                                          const d = new Date(item.pubDate);
                                          if (isNaN(d.getTime()))
                                            throw new Error("Invalid date");

                                          // If the date is parsed as being in the future due to timezone mismatch, clamp to "Just now"
                                          if (
                                            d.getTime() > new Date().getTime()
                                          ) {
                                            return "Just now";
                                          }

                                          return formatDistanceToNow(d, {
                                            addSuffix: true,
                                          });
                                        } catch (e) {
                                          // If unparseable date, try to show the raw date or a sensible default
                                          const cleanRawDate = item.pubDate
                                            ?.replace(/GMT|UTC/i, "")
                                            .trim();
                                          return cleanRawDate || "Date Unknown";
                                        }
                                      })()}
                                    </span>
                                  </div>

                                  <h3
                                    className={`text-lg font-bold text-[#2c2419] mb-3 line-clamp-3 group-hover:text-[#8b6834] transition-colors leading-snug ${getFontClass(item.title)}`}
                                  >
                                    {item.title}
                                  </h3>

                                  <p
                                    className={`text-sm text-[#5d4e37] line-clamp-3 mb-6 flex-grow leading-relaxed ${getFontClass(item.contentSnippet)}`}
                                  >
                                    {item.contentSnippet ||
                                      "No description available."}
                                  </p>

                                  {/* Action Footer */}
                                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#d4c4b0]/30 relative">
                                    {/* The Main Generate Button triggers the menu */}
                                    <button
                                      onClick={() =>
                                        setActiveThemeMenu(
                                          activeThemeMenu === item.id
                                            ? null
                                            : item.id,
                                        )
                                      }
                                      className="flex-1 px-4 py-2.5 bg-[#2c2419] hover:bg-[#8b6834] text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md group-hover:shadow-lg"
                                    >
                                      <Sparkles className="w-4 h-4" />
                                      Generate Card
                                    </button>

                                    {/* Compact Floating Theme Menu */}
                                    {activeThemeMenu === item.id && (
                                      <div
                                        className="absolute bottom-full left-0 mb-2 w-40 bg-white border border-[#d4c4b0] justify-center rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-bottom-1 duration-150"
                                        onMouseLeave={() =>
                                          setActiveThemeMenu(null)
                                        }
                                      >
                                        <div className="py-1 flex flex-col">
                                          {[
                                            { id: "classic", name: "Classic" },
                                            { id: "modern", name: "Modern" },
                                            { id: "modern2", name: "Modern 2" },
                                            {
                                              id: "vertical",
                                              name: "Vertical",
                                            },
                                            { id: "minimal", name: "Minimal" },
                                            {
                                              id: "magazine",
                                              name: "Magazine",
                                            },
                                          ].map((theme) => (
                                            <button
                                              key={theme.id}
                                              onClick={() => {
                                                handleGenerateClick(
                                                  item.link,
                                                  theme.id,
                                                );
                                              }}
                                              className="text-left px-3 py-1.5 text-xs font-semibold text-[#5d4e37] hover:bg-[#8b6834] hover:text-white transition-colors"
                                            >
                                              {theme.name}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-2.5 border border-[#d4c4b0]/60 hover:border-[#8b6834] hover:bg-[#8b6834]/5 text-[#5d4e37] hover:text-[#8b6834] rounded-xl transition-colors shrink-0"
                                      title="Read Original"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12 mb-8">
                              <button
                                onClick={() =>
                                  handlePageChange(Math.max(1, currentPage - 1))
                                }
                                disabled={currentPage === 1}
                                className="p-2 rounded-xl border border-[#d4c4b0]/40 bg-white text-[#5d4e37] hover:bg-[#8b6834] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>

                              <div className="flex items-center gap-1.5 px-2">
                                {Array.from({ length: totalPages }).map(
                                  (_, idx) => {
                                    // Simplified pagination display: max 5 pages shown
                                    const pageNumber = idx + 1;
                                    if (
                                      totalPages > 7 &&
                                      pageNumber !== 1 &&
                                      pageNumber !== totalPages &&
                                      Math.abs(pageNumber - currentPage) > 1
                                    ) {
                                      if (
                                        pageNumber === 2 ||
                                        pageNumber === totalPages - 1
                                      ) {
                                        return (
                                          <span
                                            key={idx}
                                            className="text-[#5d4e37] px-1"
                                          >
                                            ...
                                          </span>
                                        );
                                      }
                                      return null;
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() =>
                                          handlePageChange(pageNumber)
                                        }
                                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${
                                          currentPage === pageNumber
                                            ? "bg-[#8b6834] text-white border-none"
                                            : "bg-white border border-[#d4c4b0]/40 text-[#5d4e37] hover:border-[#8b6834]/50 hover:text-[#8b6834]"
                                        }`}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  },
                                )}
                              </div>

                              <button
                                onClick={() =>
                                  handlePageChange(
                                    Math.min(totalPages, currentPage + 1),
                                  )
                                }
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-xl border border-[#d4c4b0]/40 bg-white text-[#5d4e37] hover:bg-[#8b6834] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                )}
              </main>
            </>
          )}
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
