"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowLeft,
  Rss,
  Newspaper,
  CalendarClock,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  Globe2,
  Clock,
  Sparkles,
  Filter,
  Search,
  ChevronLeft,
  Lock,
  Wand2,
  RefreshCcw,
  Heading,
  Image as ImageIcon,
  Layers,
  Zap,
  LayoutGrid,
  FileText,
  Activity,
  History,
  Map,
  ListFilter,
  Hash
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UpgradeModal from "@/components/UpgradeModal";
import CompactCreditDisplay from "@/components/CompactCreditDisplay";
import DashboardSidebar from "@/components/DashboardSidebar";
import { formatDistanceToNow, parseISO } from "date-fns";

interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet: string;
  fullContent?: string;
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
  onResolve,
  className = "w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out",
}: {
  initialImageUrl?: string;
  url: string;
  sourceName: string;
  onResolve?: (resolvedUrl: string) => void;
  className?: string;
}) => {
  const [imgSrc, setImgSrc] = useState(initialImageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const isFavicon = initialImageUrl?.includes("favicons");
    if (initialImageUrl && !isFavicon) {
      if (onResolve) onResolve(initialImageUrl);
      return;
    }

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
          if (onResolve) onResolve(data.image);
        } else if (data.logo && isMounted) {
          setImgSrc(data.logo);
          if (onResolve) onResolve(data.logo);
        }
      } catch (err) {}
    };

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

  const isCurrentImgFavicon = imgSrc?.includes("favicons");

  if (hasError || !imgSrc) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0e8] text-[#d4c4b0]">
        <Newspaper className="w-10 h-10 opacity-30 animate-pulse" />
      </div>
    );
  }

  if (isCurrentImgFavicon) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#f5f0e8]">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#d4c4b0]/40 animate-pulse">
          <img
            src={imgSrc}
            alt={sourceName}
            loading="lazy"
            className={`w-8 h-8 object-contain rounded-full ${className.replace(/w-full h-full object-cover/g, '')}`}
            onError={() => setHasError(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={sourceName}
      loading="lazy"
      className={className}
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
  const router = useRouter();
  const isFreeUser = user?.plan === "Free";
  const isProUser = user?.plan === "Premium";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Store dynamically resolved images so we pass the right URL to /url without causing re-renders
  const resolvedImagesRef = React.useRef<Record<string, string>>({});

  // Pagination & Filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string>("bd");
  const [selectedSource, setSelectedSource] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const ITEMS_PER_PAGE = 24;

  const REGIONS = [
    { id: "bd", name: "Bangladesh" },
    { id: "global", name: "Global" },
    { id: "asia", name: "Asia" },
    { id: "europe", name: "Europe" },
    { id: "usa", name: "USA" },
  ];

  // Active theme menu state (stores the ID of the card whose menu is open)
  const [activeThemeMenu, setActiveThemeMenu] = useState<string | null>(null);

  // Details UI State
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(
    null,
  );
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Helper for dynamically setting fonts
  const isBangla = (text: string) => {
    // Basic regex to check for Bengali Unicode range
    return /[\u0980-\u09FF]/.test(text);
  };

  const getFontClass = (
    text: string,
    type: "filter" | "title" | "body" = "body",
  ) => {
    const isB = isBangla(text);
    if (isB) {
      const sizeClass =
        type === "title"
          ? "text-[1.15em] leading-tight"
          : type === "filter"
            ? "text-[13px] leading-none"
            : "text-[1.1em] leading-relaxed";
      return `font-noto-bengali ${sizeClass}`;
    }
    return "font-dm-sans";
  };

  const fetchNews = async (forceRefresh = false, region = selectedRegion) => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load from cache if not forcing refresh
      if (!forceRefresh) {
        const cachedStr = sessionStorage.getItem(`cachedNewsData_${region}`);
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
        fetch(`/api/news?region=${region}`),
        new Promise((r) => setTimeout(r, 800)),
      ]);

      if (!res.ok) throw new Error("Failed to fetch news");

      const data = await res.json();
      if (data.success) {
        setNews(data.data);
        setStats(data.stats);
        sessionStorage.setItem(
          `cachedNewsData_${region}`,
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
    fetchNews(false, selectedRegion);
  }, [selectedRegion]);

  const handleGenerateClick = (
    link: string,
    theme: string,
    title?: string,
    content?: string,
    image?: string
  ) => {
    sessionStorage.setItem("pendingUrlGeneration", link);
    sessionStorage.setItem("pendingThemeGeneration", theme);
    if (title) sessionStorage.setItem("pendingRemixTitle", title);
    if (content) sessionStorage.setItem("pendingRemixContent", content);
    if (image) sessionStorage.setItem("pendingRemixImage", image);
    setActiveThemeMenu(null);
    router.push("/url?auto=true");
  };

  const CustomDropdown = ({
    value,
    options,
    onChange,
    className = "",
  }: {
    value: string;
    options: { id: string; name: string }[];
    onChange: (val: string) => void;
    className?: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption =
      options.find((opt) => opt.id === value) || options[0];

    return (
      <div
        ref={dropdownRef}
        className={`relative w-full sm:w-auto h-8 ${className}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-full bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[#2c2419] rounded-none py-1 pl-3 pr-8 flex items-center justify-between transition-all hover:bg-white hover:border-[#8b6834]/30 focus:outline-none focus:border-[#8b6834]/30 ${getFontClass(selectedOption.name, "filter")}`}
        >
          <span
            className={`font-semibold truncate ${!isBangla(selectedOption.name) ? "text-[12px]" : ""}`}
          >
            {selectedOption.name}
          </span>
          <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
            <ChevronDown
              className={`w-4 h-4 text-[#8b6834] transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-[100] top-[calc(100%+4px)] left-0 w-full bg-white border-2 border-[#d4c4b0] max-h-64 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150 shadow-sm">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 font-semibold transition-colors flex items-center justify-between
                  ${option.id === value ? "bg-[#8b6834] text-white" : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#8b6834]"}
                  ${getFontClass(option.name, "filter")} ${!isBangla(option.name) ? "text-[12px]" : ""}`}
              >
                <span className="truncate">{option.name}</span>
                {option.id === value && (
                  <Sparkles className="w-3 h-3 text-white/60 ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

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
            className="bg-white rounded-none border-2 border-[#d4c4b0] overflow-hidden flex flex-col h-[400px] animate-pulse"
          >
            <div className="h-48 bg-[#d4c4b0]/20 w-full" />
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-24 bg-[#d4c4b0]/30 rounded-none" />
                <div className="h-4 w-16 bg-[#d4c4b0]/20 rounded-none" />
              </div>
              <div className="space-y-3 mb-4">
                <div className="h-6 bg-[#d4c4b0]/40 rounded-none w-full" />
                <div className="h-6 bg-[#d4c4b0]/40 rounded-none w-4/5" />
              </div>
              <div className="mt-auto h-12 bg-[#d4c4b0]/20 rounded-none w-full" />
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
        <DashboardSidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          onUpgrade={(feature) => {
            setUpgradeFeature(feature);
            setShowUpgradeModal(true);
          }}
          user={user}
          logout={logout}
          isFreeUser={isFreeUser}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {isFreeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-[#faf8f5]/50 backdrop-blur-sm">
              <div className="w-24 h-24 rounded-none bg-white border-2 border-[#d4c4b0] shadow-none flex items-center justify-center text-[#8b6834] mb-8 animate-bounce">
                <Lock className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black text-[#2c2419] mb-4 uppercase tracking-tight">
                Today's News
              </h1>
              <p className="text-[#5d4e37] max-w-md mb-8 leading-relaxed font-medium">
                Stay ahead of the competition with real-time news feeds from top
                sources. Generate professional newscards from the latest
                headlines in seconds.
              </p>
              <button
                onClick={() => {
                  setUpgradeFeature("Today's News Feed");
                  setShowUpgradeModal(true);
                }}
                className="px-8 py-4 bg-[#8b6834] text-white text-xs font-black uppercase tracking-widest rounded-none border-2 border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] transform hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Upgrade to Premium
              </button>
            </div>
          ) : (
            <>
              {/* Top Header */}
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
                      Today's News
                    </h2>
                  </div>

                  <div className="hidden lg:flex items-center flex-1 max-w-md ml-8">
                    <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b49e82]" />
                      <input
                        type="text"
                        placeholder="Search tools or templates..."
                        className="w-full h-11 bg-[#f5f0e8]/50 border-2 border-[#d4c4b0]/40 rounded-none px-12 text-sm font-medium focus:outline-none focus:border-[#8b6834]/30 transition-all placeholder:text-[#b49e82]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <CompactCreditDisplay />
                </div>
              </header>

              {/* Main Content Scrollable Area */}
              <main className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-10 py-8 scroll-smooth">
                {/* Stats Overview */}
                {!isLoading && !error && stats && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="bg-white rounded-none p-4 border-2 border-[#d4c4b0] shadow-none flex items-center gap-4 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[#8b6834]/5 rounded-none blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-10 h-10 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Articles Today
                        </h3>
                        <p className="text-2xl font-inter font-black text-[#2c2419] leading-none mt-1">
                          {stats.total}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-none p-4 border-2 border-[#d4c4b0] shadow-none flex items-center gap-4 relative overflow-hidden">
                      <div className="w-10 h-10 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Active Sources
                        </h3>
                        <p className="text-2xl font-inter font-black text-[#2c2419] leading-none mt-1">
                          {stats.sources}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-none p-4 border-2 border-[#d4c4b0] shadow-none flex items-center gap-4 relative overflow-hidden">
                      <div className="w-10 h-10 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Last Updated
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm font-inter font-black text-[#2c2419]">
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
                            className="p-1 px-2 bg-[#f5f0e8] hover:bg-[#8b6834] text-[#8b6834] hover:text-white rounded-none transition-colors border border-[#d4c4b0]/50"
                            title="Refresh Feed"
                          >
                            <svg
                              className="w-3.5 h-3.5"
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
                      </div>
                    </div>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-8 rounded-none mb-8 flex flex-col items-center text-center">
                    <Globe2 className="w-12 h-12 text-red-400 mb-4" />
                    <h3 className="text-lg font-black uppercase mb-2">
                      Failed to load news feed
                    </h3>
                    <p className="text-sm max-w-md font-medium">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-6 px-6 py-2 bg-red-100 text-red-700 text-xs font-black uppercase rounded-none border-2 border-red-200 hover:bg-red-200 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                )}

                {/* Filter Controls */}
                {!isLoading && !error && news.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
                    <CustomDropdown
                      value={selectedSource}
                      options={[
                        { id: "All", name: "All Sources" },
                        ...uniqueSources.map((s) => ({
                          id: s,
                          name: s,
                        })),
                      ]}
                      onChange={(val) => {
                        setSelectedSource(val);
                        setCurrentPage(1);
                      }}
                      className="sm:w-[160px]"
                    />

                    <CustomDropdown
                      value={selectedCategory}
                      options={[
                        { id: "All", name: "All Categories" },
                        ...uniqueCategories.map((c) => ({ id: c, name: c })),
                      ]}
                      onChange={(val) => {
                        setSelectedCategory(val);
                        setCurrentPage(1);
                      }}
                      className="sm:w-[140px]"
                    />

                    <CustomDropdown
                      value={selectedRegion}
                      options={REGIONS}
                      onChange={(val) => {
                        setSelectedRegion(val);
                        setCurrentPage(1);
                      }}
                      className="sm:w-[120px]"
                    />
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
                        <div className="text-center py-20 bg-white rounded-none border-2 border-[#d4c4b0]">
                          <Newspaper className="w-12 h-12 text-[#d4c4b0] mx-auto mb-4" />
                          <h3 className="text-lg font-black uppercase text-[#2c2419]">
                            No news found
                          </h3>
                          <p className="text-[#5d4e37] text-sm font-medium">
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
                            <h2 className="text-xl font-black uppercase text-[#2c2419]">
                              Live Headlines
                            </h2>
                            <div className="flex-1 h-px bg-[#d4c4b0]"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#5d4e37]">
                              Page {currentPage} of {totalPages}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {currentItems.map((item) => (
                              <div
                                key={item.id}
                                className="bg-white rounded-none border-2 border-[#d4c4b0] shadow-none hover:border-[#8b6834] transition-all duration-300 overflow-hidden flex flex-col group h-full"
                              >
                                {/* Image Header */}
                                <div className="h-48 relative overflow-hidden bg-[#f5f0e8] group/image border-b border-[#d4c4b0]/30">
                                  <NewsImage
                                    initialImageUrl={item.imageUrl}
                                    url={item.link}
                                    sourceName={item.source}
                                    onResolve={(url) => {
                                      resolvedImagesRef.current[item.id] = url;
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                                  {/* Origin Link - Moved to Top Right */}
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur border-2 border-[#2c2419] text-[#2c2419] hover:bg-[#8b6834] hover:text-white hover:border-[#8b6834] z-10 rounded-none shadow-[2px_2px_0_0_#2c2419] hover:shadow-none translate-x-[2px] translate-y-[2px] opacity-0 group-hover/image:opacity-100 pointer-events-auto transition-all"
                                    title="Read Original Article"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                  </a>

                                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between pointer-events-none">
                                    <div className="flex items-center gap-2 bg-[#8b6834] px-2.5 py-1 rounded-none shadow-none pointer-events-auto">
                                      {item.faviconUrl && (
                                        <img
                                          src={item.faviconUrl}
                                          alt={`${item.source} icon`}
                                          className="w-3 h-3 rounded-none object-contain bg-white/20"
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
                                    className={`text-lg font-bold text-[#2c2419] mb-3 line-clamp-3 group-hover:text-[#8b6834] transition-colors leading-snug ${getFontClass(item.title, "title")}`}
                                  >
                                    {item.title}
                                  </h3>

                                  <p
                                    className={`text-sm text-[#5d4e37] line-clamp-3 mb-6 flex-grow leading-relaxed ${getFontClass(item.contentSnippet, "body")}`}
                                  >
                                    {item.contentSnippet ||
                                      "No description available."}
                                  </p>

                                  {/* Action Footer */}
                                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#d4c4b0]/30 relative">
                                    {/* Primary Details Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedNewsItem(item);
                                        setIsDetailsModalOpen(true);
                                      }}
                                      className="flex-1 px-4 py-2 bg-[#8b6834] hover:bg-[#2c2419] text-white text-sm font-bold rounded-none transition-colors flex items-center justify-center gap-2 border-2 border-[#8b6834] hover:border-[#2c2419]"
                                    >
                                      <Menu className="w-4 h-4" />
                                      Details
                                    </button>

                                    {/* Quick Create Icon */}
                                    <button
                                      onClick={() => {
                                        const finalImage = resolvedImagesRef.current[item.id] || item.imageUrl;
                                        handleGenerateClick(
                                          item.link,
                                          "duo",
                                          item.title,
                                          item.contentSnippet,
                                          finalImage
                                        );
                                      }}
                                      className="p-2 bg-white border-2 border-[#d4c4b0] hover:border-[#8b6834] text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#f5f0e8] rounded-none transition-colors flex items-center justify-center"
                                      title="Quick Create Photocard"
                                    >
                                      <LayoutGrid className="w-4 h-4" />
                                    </button>
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
                                className="p-2 rounded-none border-2 border-[#d4c4b0] bg-white text-[#5d4e37] hover:bg-[#8b6834] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-none"
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
                                        className={`w-10 h-10 rounded-none font-black text-xs transition-all shadow-none ${
                                          currentPage === pageNumber
                                            ? "bg-[#8b6834] text-white border-2 border-[#8b6834]"
                                            : "bg-white border-2 border-[#d4c4b0] text-[#5d4e37] hover:border-[#8b6834]/50 hover:text-[#8b6834]"
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
                                className="p-2 rounded-none border-2 border-[#d4c4b0] bg-white text-[#5d4e37] hover:bg-[#8b6834] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-none"
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

      {/* Details Modal */}
      {isDetailsModalOpen && selectedNewsItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2c2419]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border text-[#2c2419] border-[#d4c4b0] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-none rounded-none animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#d4c4b0] bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f0e8] text-[#8b6834] flex items-center justify-center border border-[#d4c4b0]">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2c2419] uppercase tracking-tight">
                    News Details
                  </h2>
                  <p className="text-xs text-[#5d4e37] font-bold uppercase tracking-widest mt-0.5">
                    Review before creating card
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-2 hover:bg-[#f5f0e8] text-[#5d4e37] hover:text-[#2c2419] transition-colors border border-transparent"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-[#faf8f5] flex flex-col gap-6">
              {(resolvedImagesRef.current[selectedNewsItem.id] || selectedNewsItem.imageUrl) && (
                <div className="w-full h-64 border border-[#d4c4b0] relative bg-[#f5f0e8] flex items-center justify-center overflow-hidden">
                  {(() => {
                    const imgSrc = resolvedImagesRef.current[selectedNewsItem.id] || selectedNewsItem.imageUrl;
                    const isFavicon = imgSrc?.includes("favicons");
                    
                    if (isFavicon) {
                      return (
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm border border-[#d4c4b0]/40">
                          <img
                            src={imgSrc}
                            alt={selectedNewsItem.title}
                            className="w-12 h-12 object-contain rounded-full"
                          />
                        </div>
                      );
                    }
                    
                    return (
                      <img
                        src={imgSrc}
                        alt={selectedNewsItem.title}
                        className="w-full h-full object-cover"
                      />
                    );
                  })()}
                </div>
              )}

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  {selectedNewsItem.faviconUrl && (
                    <img
                      src={selectedNewsItem.faviconUrl}
                      alt={selectedNewsItem.source}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <span className={`text-[#8b6834] text-xs font-bold uppercase tracking-wider ${getFontClass(selectedNewsItem.source)}`}>
                    {selectedNewsItem.source}
                  </span>
                  <span className="text-[#d4c4b0]">•</span>
                  <span className="text-[#5d4e37] text-xs font-semibold flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {(() => {
                      try {
                        const d = new Date(selectedNewsItem.pubDate);
                        if (isNaN(d.getTime())) throw new Error("Invalid date");
                        if (d.getTime() > new Date().getTime()) return "Just now";
                        return formatDistanceToNow(d, { addSuffix: true });
                      } catch (e) {
                        return selectedNewsItem.pubDate?.replace(/GMT|UTC/i, "").trim() || "Date Unknown";
                      }
                    })()}
                  </span>
                </div>

                <h3 className={`text-2xl font-bold text-[#2c2419] leading-snug ${getFontClass(selectedNewsItem.title, "title")}`}>
                  {selectedNewsItem.title}
                </h3>

                <p className={`text-[#5d4e37] leading-relaxed ${getFontClass(selectedNewsItem.contentSnippet || "", "body")}`}>
                  {selectedNewsItem.contentSnippet || "No description available."}
                </p>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 sm:p-6 border-t border-[#d4c4b0] bg-white flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-2.5 bg-white text-[#5d4e37] text-xs font-black uppercase tracking-widest border border-[#d4c4b0] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const finalImage = resolvedImagesRef.current[selectedNewsItem.id] || selectedNewsItem.imageUrl;
                  handleGenerateClick(selectedNewsItem.link, "duo", selectedNewsItem.title, selectedNewsItem.contentSnippet, finalImage);
                }}
                className="px-8 py-2.5 bg-[#8b6834] text-white text-xs font-black uppercase tracking-widest border border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] transition-colors flex items-center justify-center gap-2"
              >
                <LayoutGrid className="w-4 h-4" />
                Create Photocard
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Premium"
      />
    </ProtectedRoute>
  );
}
