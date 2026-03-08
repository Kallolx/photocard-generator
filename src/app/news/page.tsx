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
  const router = useRouter();
  const isFreeUser = user?.plan === "Free";
  const isProUser = user?.plan === "Premium";

  const [news, setNews] = useState<NewsItem[]>([]);
  const [stats, setStats] = useState<NewsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Remix UI State
  const [selectedRemixItem, setSelectedRemixItem] = useState<NewsItem | null>(
    null,
  );
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [remixData, setRemixData] = useState({
    headline: "",
    content: "",
    socialTitle: "",
    customPrompt: "",
    customImage: "",
  });
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixError, setRemixError] = useState<string | null>(null);

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

  const handleGenerateClick = (link: string, theme: string) => {
    // Navigate to /url and pass the link as a query parameter or localStorage
    // Using sessionStorage is cleaner for a temporary passing of state
    sessionStorage.setItem("pendingUrlGeneration", link);
    sessionStorage.setItem("pendingThemeGeneration", theme);
    // If the user modified the content via remix, save it to session
    if (remixData.headline || remixData.content) {
      sessionStorage.setItem("pendingRemixTitle", remixData.headline);
      sessionStorage.setItem("pendingRemixContent", remixData.content);
    }
    setActiveThemeMenu(null); // close menu
    router.push("/url?auto=true");
  };

  const handleRemix = async () => {
    if (!selectedRemixItem) return;
    try {
      setIsRemixing(true);
      setRemixError(null);
      // We will integrate the direct API call handling here when we switch to a server route,
      // but for now, we'll try to hit a local api wrapper, or directly if ai-service is exposed.
      // Since ai-service is in lib, we should ideally have an API route.
      // Assuming we have or will create `/api/remix`
      const res = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: selectedRemixItem.title,
          content: selectedRemixItem.contentSnippet || "No content available",
          customPrompt: remixData.customPrompt,
        }),
      });

      if (!res.ok) throw new Error("Failed to generate remix");
      const data = await res.json();

      if (data.success && data.data) {
        setRemixData((prev) => ({
          ...prev,
          headline: data.data.rewrittenHeadline || prev.headline,
          content: data.data.rewrittenContent || prev.content,
          socialTitle: data.data.socialMediaTitle || prev.socialTitle,
        }));
      } else {
        throw new Error(data.error || "Failed to generate remix");
      }
    } catch (err: any) {
      setRemixError(err.message || "Failed to communicate with AI");
    } finally {
      setIsRemixing(false);
    }
  };

  const CustomDropdown = ({
    value,
    options,
    onChange,
    icon: Icon,
    label,
    className = "",
  }: {
    value: string;
    options: { id: string; name: string; icon?: string | React.ReactNode }[];
    onChange: (val: string) => void;
    icon: any;
    label?: string;
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
        className={`relative w-full sm:w-auto h-11 ${className}`}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full h-full bg-[#f5f0e8] border-2 border-[#d4c4b0]/40 text-[#2c2419] rounded-none py-2 pl-9 pr-10 flex items-center justify-between transition-all hover:bg-white hover:border-[#8b6834]/30 focus:outline-none focus:border-[#8b6834]/30 ${getFontClass(selectedOption.name, "filter")}`}
        >
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            {selectedOption.icon && typeof selectedOption.icon === "string" ? (
              <img
                src={selectedOption.icon}
                alt=""
                className="w-4 h-4 rounded-full border border-[#d4c4b0]/40 object-contain"
              />
            ) : (
              <Icon className="w-4 h-4 text-[#8b6834]" />
            )}
          </div>
          <span
            className={`font-black uppercase tracking-widest truncate ${!isBangla(selectedOption.name) ? "text-[11px]" : ""}`}
          >
            {selectedOption.name}
          </span>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronRight
              className={`w-4 h-4 text-[#8b6834] transition-transform duration-200 ${isOpen ? "rotate-90" : "rotate-0"}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-[100] top-[calc(100%+4px)] left-0 w-full bg-white border-2 border-[#d4c4b0] max-h-64 overflow-y-auto no-scrollbar animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 font-black uppercase tracking-widest transition-colors flex items-center justify-between
                  ${option.id === value ? "bg-[#8b6834] text-white" : "text-[#5d4e37] hover:bg-[#f5f0e8] hover:text-[#8b6834]"}
                  ${getFontClass(option.name, "filter")} ${!isBangla(option.name) ? "text-[11px]" : ""}`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {option.icon && typeof option.icon === "string" ? (
                    <img
                      src={option.icon}
                      alt=""
                      className="w-4 h-4 rounded-full border border-[#d4c4b0]/40 shrink-0 object-contain"
                    />
                  ) : option.icon ? (
                    <div className="shrink-0">{option.icon}</div>
                  ) : null}
                  <span className="truncate">{option.name}</span>
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-white rounded-none p-6 border-2 border-[#d4c4b0] shadow-none flex items-center gap-5 relative overflow-hidden">
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[#8b6834]/5 rounded-none blur-2xl -translate-y-1/2 translate-x-1/2" />
                      <div className="w-14 h-14 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Articles Today
                        </h3>
                        <p className="text-3xl font-inter font-black text-[#2c2419]">
                          {stats.total}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-none p-6 border-2 border-[#d4c4b0] shadow-none flex items-center gap-5 relative overflow-hidden">
                      <div className="w-14 h-14 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <Globe2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Active Sources
                        </h3>
                        <p className="text-3xl font-inter font-black text-[#2c2419]">
                          {stats.sources}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-none p-6 border-2 border-[#d4c4b0] shadow-none flex items-center gap-5 relative overflow-hidden">
                      <div className="w-14 h-14 rounded-none bg-[#f5f0e8] flex items-center justify-center text-[#8b6834] flex-shrink-0 border border-[#d4c4b0]/30 shadow-none">
                        <Clock className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-[10px] font-black text-[#b49e82] uppercase tracking-widest">
                          Last Updated
                        </h3>
                        <div className="flex items-center gap-3">
                          <p className="text-base font-inter font-black text-[#2c2419]">
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
                            className="p-1 px-2.5 bg-[#f5f0e8] hover:bg-[#8b6834] text-[#8b6834] hover:text-white rounded-none transition-colors border border-[#d4c4b0]/50"
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
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 bg-white p-4 rounded-none border-2 border-[#d4c4b0]">
                    <div className="relative w-full sm:w-auto flex-1 h-11">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5d4e37]" />
                      <input
                        type="text"
                        placeholder="Search headlines..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full h-11 pl-9 pr-4 bg-[#f5f0e8] text-[#2c2419] border-2 border-[#d4c4b0]/40 rounded-none text-sm font-medium focus:outline-none focus:border-[#8b6834]/30"
                      />
                    </div>

                    <CustomDropdown
                      value={selectedSource}
                      options={[
                        { id: "All", name: "All Sources" },
                        ...uniqueSources.map((s) => ({
                          id: s,
                          name: s,
                          icon: news.find((n) => n.source === s)?.faviconUrl,
                        })),
                      ]}
                      onChange={(val) => {
                        setSelectedSource(val);
                        setCurrentPage(1);
                      }}
                      icon={Filter}
                      className="sm:w-[220px]"
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
                      icon={LayoutGrid}
                      className="sm:w-[200px]"
                    />

                    <CustomDropdown
                      value={selectedRegion}
                      options={REGIONS}
                      onChange={(val) => {
                        setSelectedRegion(val);
                        setCurrentPage(1);
                      }}
                      icon={Globe2}
                      className="sm:w-[180px]"
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
                                <div className="h-48 relative overflow-hidden bg-[#f5f0e8] group/image">
                                  <NewsImage
                                    initialImageUrl={item.imageUrl}
                                    url={item.link}
                                    sourceName={item.source}
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
                                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-[#d4c4b0]/30 relative">
                                    {/* Primary Remix Button */}
                                    <button
                                      onClick={() => {
                                        setSelectedRemixItem(item);
                                        setRemixData({
                                          headline: item.title,
                                          content:
                                            item.fullContent ||
                                            item.contentSnippet,
                                          socialTitle: "",
                                          customPrompt: "",
                                          customImage: "",
                                        });
                                        setIsRemixModalOpen(true);
                                      }}
                                      className="flex-1 px-4 py-2.5 bg-[#8b6834] hover:bg-[#2c2419] text-white text-xs font-black uppercase tracking-widest rounded-none transition-colors flex items-center justify-center gap-2 border-2 border-[#8b6834] hover:border-[#2c2419]"
                                    >
                                      <Wand2 className="w-4 h-4" />
                                      Remix
                                    </button>

                                    {/* Secondary Theme Menu Trigger */}
                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setActiveThemeMenu(
                                            activeThemeMenu === item.id
                                              ? null
                                              : item.id,
                                          )
                                        }
                                        className="p-2.5 bg-white border-2 border-[#d4c4b0] hover:border-[#8b6834] text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#f5f0e8] rounded-none transition-colors flex items-center justify-center"
                                        title="Quick Generate Card"
                                      >
                                        <LayoutGrid className="w-4 h-4" />
                                      </button>

                                      {/* Compact Floating Theme Menu */}
                                      {activeThemeMenu === item.id && (
                                        <div
                                          className="absolute bottom-full right-0 mb-2 w-40 bg-white border-2 border-[#d4c4b0] justify-center rounded-none shadow-none z-50 animate-in fade-in slide-in-from-bottom-1 duration-150"
                                          onMouseLeave={() =>
                                            setActiveThemeMenu(null)
                                          }
                                        >
                                          <div className="py-1 flex flex-col">
                                            {[
                                              {
                                                id: "classic",
                                                name: "Classic",
                                              },
                                              { id: "modern", name: "Modern" },
                                              {
                                                id: "modern2",
                                                name: "Modern 2",
                                              },
                                              {
                                                id: "vertical",
                                                name: "Vertical",
                                              },
                                              {
                                                id: "minimal",
                                                name: "Minimal",
                                              },
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
                                    </div>
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

      {/* Remix Modal */}
      {isRemixModalOpen && selectedRemixItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#2c2419]/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border text-[#2c2419] border-[#d4c4b0] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-none rounded-none animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#d4c4b0] bg-white flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#f5f0e8] text-[#8b6834] flex items-center justify-center border border-[#d4c4b0]">
                  <Wand2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#2c2419] uppercase tracking-tight">
                    AI Remix Studio
                  </h2>
                  <p className="text-xs text-[#5d4e37] font-bold uppercase tracking-widest mt-0.5">
                    Customize before generating
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRemixModalOpen(false)}
                className="p-2 hover:bg-[#f5f0e8] text-[#5d4e37] hover:text-[#2c2419] transition-colors border border-transparent"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto bg-[#faf8f5] grid md:grid-cols-2 gap-8">
              {/* Left Column: Edit Fields */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#2c2419] uppercase tracking-widest mb-2">
                    <Heading className="w-4 h-4 text-[#8b6834]" />
                    Headline
                  </label>
                  <textarea
                    value={remixData.headline}
                    onChange={(e) =>
                      setRemixData({ ...remixData, headline: e.target.value })
                    }
                    className={`w-full p-4 bg-white border border-[#d4c4b0] text-[#2c2419] font-bold rounded-none focus:bg-white focus:outline-none focus:border-[#8b6834] transition-colors min-h-[90px] resize-none ${getFontClass(remixData.headline, "title")}`}
                    placeholder="Enter customized headline..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#2c2419] uppercase tracking-widest mb-2">
                    <Newspaper className="w-4 h-4 text-[#8b6834]" />
                    Content
                  </label>
                  <textarea
                    value={remixData.content}
                    onChange={(e) =>
                      setRemixData({ ...remixData, content: e.target.value })
                    }
                    className={`w-full p-4 bg-white border border-[#d4c4b0] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:border-[#8b6834] transition-colors min-h-[140px] resize-none ${getFontClass(remixData.content, "body")}`}
                    placeholder="Enter customized story content..."
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#2c2419] uppercase tracking-widest mb-2">
                    <Globe2 className="w-4 h-4 text-[#8b6834]" />
                    Social Media Ready Title
                  </label>
                  <textarea
                    value={remixData.socialTitle}
                    onChange={(e) =>
                      setRemixData({
                        ...remixData,
                        socialTitle: e.target.value,
                      })
                    }
                    className={`w-full p-4 bg-white border border-[#d4c4b0] text-[#2c2419] rounded-none focus:bg-white focus:outline-none focus:border-[#8b6834] transition-colors min-h-[80px] resize-none ${getFontClass(remixData.socialTitle, "body")}`}
                    placeholder="Social media optimized title will appear here..."
                  />
                </div>

                {remixError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                    {remixError}
                  </div>
                )}

                {isProUser ? (
                  <button
                    onClick={handleRemix}
                    disabled={isRemixing}
                    className="w-full py-3.5 bg-[#8b6834] text-white text-xs font-black uppercase tracking-widest hover:bg-[#2c2419] transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    <RefreshCcw
                      className={`w-4 h-4 ${isRemixing ? "animate-spin" : ""}`}
                    />
                    {isRemixing
                      ? "Rewriting with AI..."
                      : "AI Auto-Rewrite Content"}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsRemixModalOpen(false);
                        setUpgradeFeature("AI Remix & Auto-Rewrite");
                        setShowUpgradeModal(true);
                      }}
                      className="w-full py-3.5 bg-[#f5f0e8] text-[#8b6834] text-xs font-black uppercase tracking-widest border-2 border-[#d4c4b0] hover:bg-[#8b6834] hover:text-white hover:border-[#8b6834] transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      AI Auto-Rewrite — Pro Only
                    </button>
                    <p className="text-center text-[10px] text-[#b49e82] font-bold uppercase tracking-widest">
                      You can still edit manually above
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Preview/Image Options */}
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-xs font-black text-[#2c2419] uppercase tracking-widest mb-2">
                    <ImageIcon className="w-4 h-4 text-[#8b6834]" />
                    Source Image
                  </label>
                  <div className="border border-[#d4c4b0] aspect-video relative bg-white flex items-center justify-center group overflow-hidden">
                    {remixData.customImage || selectedRemixItem.imageUrl ? (
                      <>
                        <img
                          src={
                            remixData.customImage || selectedRemixItem.imageUrl
                          }
                          alt="Source"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <label className="cursor-pointer px-4 py-2 bg-white text-[#2c2419] text-xs font-black uppercase tracking-widest border border-transparent hover:border-[#8b6834] hover:text-[#8b6834] transition-colors">
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (e) => {
                                    setRemixData({
                                      ...remixData,
                                      customImage: e.target?.result as string,
                                    });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <ImageIcon className="w-8 h-8 text-[#d4c4b0] mx-auto mb-2" />
                        <span className="text-xs font-bold text-[#5d4e37] uppercase">
                          No Image Found
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white p-5 border border-[#d4c4b0]">
                  <h3 className="text-xs font-black text-[#2c2419] uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#8b6834]" />
                    AI Image Generation
                  </h3>
                  <textarea
                    value={remixData.customPrompt}
                    onChange={(e) =>
                      setRemixData({
                        ...remixData,
                        customPrompt: e.target.value,
                      })
                    }
                    className="w-full p-4 bg-[#f5f0e8] border border-[#d4c4b0] text-[#2c2419] text-sm rounded-none focus:bg-white focus:outline-none focus:border-[#8b6834] transition-colors min-h-[90px] resize-none"
                    placeholder="Describe an image you'd like the AI to generate for this story..."
                  />
                  <button
                    disabled={true}
                    className="mt-3 w-full py-3.5 bg-gradient-to-r from-[#8b6834] to-[#b49e82] text-white text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:cursor-not-allowed shadow-none"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate AI Image (Soon)
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 sm:p-6 border-t border-[#d4c4b0] bg-white flex flex-col sm:flex-row gap-3 justify-end flex-shrink-0">
              <button
                onClick={() => setIsRemixModalOpen(false)}
                className="px-6 py-2.5 bg-white text-[#5d4e37] text-xs font-black uppercase tracking-widest border border-[#d4c4b0] hover:bg-[#f5f0e8] hover:text-[#2c2419] transition-colors"
              >
                Cancel
              </button>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setIsRemixModalOpen(false)}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#f5f0e8] text-[#8b6834] text-xs font-black uppercase tracking-widest border border-[#d4c4b0] hover:bg-[#e8dcc8] transition-colors flex items-center justify-center gap-2"
                  title="Coming Soon"
                >
                  <Globe2 className="w-4 h-4" />
                  Publish to Web
                </button>
                <button
                  onClick={() => {
                    handleGenerateClick(selectedRemixItem.link, "modern");
                  }}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-[#8b6834] text-white text-xs font-black uppercase tracking-widest border border-[#8b6834] hover:bg-[#2c2419] hover:border-[#2c2419] transition-colors flex items-center justify-center gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Create Photocard
                </button>
              </div>
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
