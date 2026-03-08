"use client";

import { DotBackground } from "@/components/DotBackground";
import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import ClassicIslamicCard from "@/components/cards/islamic-cards/ClassicIslamicCard";
import SplitIslamicCard from "@/components/cards/islamic-cards/SplitIslamicCard";
import DownloadControls from "@/components/DownloadControls";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import UpgradeModal from "@/components/UpgradeModal";
import { IslamicCardFontStyles, IslamicCardVisibilitySettings, FooterItem, FooterItemType } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, Edit, Edit2, Plus, X, Eye, EyeOff } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
const BANGLA_FONTS = [
  { id: "Noto Serif Bengali", name: "Noto Serif" },
  { id: "Hind Siliguri", name: "Hind Siliguri" },
  { id: "Tiro Bangla", name: "Tiro Bangla" },
];

const WEIGHT_CHIPS = [
  { label: "N", value: "400" },
  { label: "M", value: "500" },
  { label: "S", value: "600" },
  { label: "B", value: "700" },
  { label: "XB", value: "800" },
] as const;

const FOOTER_TYPES: { value: FooterItemType; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "twitter", label: "Twitter / X" },
  { value: "tiktok", label: "TikTok" },
  { value: "website", label: "Website" },
  { value: "text", label: "Text" },
];

const DEFAULT_FONT_STYLES: IslamicCardFontStyles = {
  narrator: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "14px",
    fontWeight: "600",
    color: "#c9a84c",
    textAlign: "center",
    letterSpacing: "0.03em",
  },
  hadisText: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "20px",
    fontWeight: "700",
    color: "#f0ebe0",
    textAlign: "center",
    letterSpacing: "0px",
  },
  source: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "12px",
    fontWeight: "500",
    color: "#c9a84c",
    textAlign: "center",
    letterSpacing: "0.04em",
  },
  footer: {
    fontFamily: "Noto Serif Bengali",
    fontSize: "12px",
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: "0px",
  },
};

// ── Islamic themes ───────────────────────────────────────────────────────────
const ISLAMIC_THEMES = [
  { id: "classic", name: "Classic Islamic", preview: "/themes/1.png" },
  { id: "split", name: "Scenic Split", preview: "/themes/2.png" },
];

// ── Footer helpers ───────────────────────────────────────────────────────────
const FOOTER_PLATFORMS: { id: FooterItemType; icon: React.ReactNode }[] = [
  { id: "facebook", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
  { id: "instagram", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg> },
  { id: "youtube", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
  { id: "twitter", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
  { id: "tiktok", icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg> },
  { id: "website", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg> },
  { id: "text", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
];

function FooterItemForm({
  onAdd, onCancel, initialType, initialValue,
}: {
  onAdd: (item: FooterItem) => void;
  onCancel?: () => void;
  initialType?: FooterItemType;
  initialValue?: string;
}) {
  const [type, setType] = useState<FooterItemType>(initialType ?? "facebook");
  const [value, setValue] = useState(initialValue ?? "");
  const placeholder = type === "website" ? "www.example.com" : type === "text" ? "Any text..." : "@username";
  return (
    <div className="border border-dashed border-[#d4c4b0] p-3 space-y-2">
      <p className="text-xs font-semibold text-[#2c2419]">{onCancel ? "Edit Item" : "Add Item"}</p>
      <div className="flex gap-1.5 flex-wrap">
        {FOOTER_PLATFORMS.map((p) => (
          <button key={p.id} type="button" onClick={() => setType(p.id)} title={p.id}
            className={`p-2 w-9 h-9 flex items-center justify-center transition-all border ${
              type === p.id ? "bg-[#8b6834] text-white border-[#8b6834]" : "bg-white text-[#5d4e37] border-[#d4c4b0] hover:bg-[#f5f0e8]"
            }`}>
            {p.icon}
          </button>
        ))}
      </div>
      <input type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder}
        className="w-full text-xs border border-[#d4c4b0] bg-white text-[#2c2419] px-2 py-2 outline-none" />
      <button
        onClick={() => { if (!value.trim()) return; onAdd({ id: Date.now().toString(), type, value: value.trim() }); setValue(""); onCancel?.(); }}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#8b6834] text-white text-xs font-bold hover:bg-[#6b4f28] transition-colors">
        <Plus className="w-3.5 h-3.5" /> {onCancel ? "Save" : "Add"}
      </button>
      {onCancel && (
        <button onClick={onCancel} className="w-full py-1.5 text-xs text-[#8b7055] hover:text-[#2c2419] transition-colors">Cancel</button>
      )}
    </div>
  );
}

function FooterItemsList({
  footerItems, onFooterItemsChange,
}: {
  footerItems: FooterItem[];
  onFooterItemsChange: (items: FooterItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {footerItems.map((item) =>
        editingId === item.id ? (
          <FooterItemForm key={item.id} initialType={item.type} initialValue={item.value}
            onAdd={(updated) => { onFooterItemsChange(footerItems.map((i) => i.id === item.id ? { ...updated, id: item.id } : i)); setEditingId(null); }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div key={item.id} className="flex items-center gap-2 border border-[#d4c4b0] bg-white px-3 py-2">
            <span className="leading-none shrink-0 flex items-center">
              {item.type === "facebook" && <svg className="w-4 h-4 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
              {item.type === "instagram" && <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><defs><radialGradient id="ig-list" cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs><rect width="24" height="24" rx="6" fill="url(#ig-list)" /><rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" /><circle cx="16.3" cy="7.7" r="0.8" fill="#fff" /></svg>}
              {item.type === "youtube" && <svg className="w-4 h-4 text-[#ff0000]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
              {item.type === "twitter" && <svg className="w-4 h-4 text-[#1d9bf0]" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
              {item.type === "tiktok" && <svg className="w-4 h-4 text-[#EE1D52]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg>}
              {item.type === "website" && <svg className="w-4 h-4 text-[#8b6834]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
              {item.type === "text" && <span className="text-xs font-bold text-[#8b7055]">T</span>}
            </span>
            <span className="flex-1 text-xs font-medium text-[#2c2419] truncate">{item.value || <span className="text-[#8b7055] italic">{item.type}</span>}</span>
            <button onClick={() => setEditingId(item.id)} className="shrink-0 text-[#8b6834] hover:text-[#6b4f28] transition-colors" title="Edit">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onFooterItemsChange(footerItems.filter((i) => i.id !== item.id))} className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      )}
    </div>
  );
}

// ── Square toggle ─────────────────────────────────────────────────────────────
function SquareToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-14 h-7 transition-colors border-2 ${
        value ? "bg-[#8b6834] border-[#8b6834]" : "bg-[#d4c4b0] border-[#d4c4b0]"
      }`}
    >
      <div
        className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
          value ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  );
}

// ── Page component ─────────────────────────────────────────────────────────────
export default function IslamicPage() {
  const { user } = useAuth();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Card data state
  const [logo, setLogo] = useState("");
  const [narrator, setNarrator] = useState("রাসুলুল্লাহ ﷺ বলেছেন:");
  const [hadisText, setHadisText] = useState("");
  const [source, setSource] = useState("");
  const [fontStyles, setFontStyles] = useState<IslamicCardFontStyles>(DEFAULT_FONT_STYLES);
  const [visibilitySettings, setVisibilitySettings] = useState<IslamicCardVisibilitySettings>({
    showLogo: true,
    showNarrator: true,
    showSource: true,
    showFooter: false,
  });
  const [footerItems, setFooterItems] = useState<FooterItem[]>([]);
  const [footerOpacity, setFooterOpacity] = useState(100);
  const [footerIconColor, setFooterIconColor] = useState<"white" | "colored">("white");

  // Layout state
  const [leftPanelWidth, setLeftPanelWidth] = useState(33.333);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Sidebar tab state
  const [activeTab, setActiveTab] = useState<"Theme" | "Uploads" | "Content" | "Fonts" | "Visibility" | "Footer">("Content");

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState("classic");

  // Font accordion state
  const [expandedFontSection, setExpandedFontSection] = useState<string | null>("hadisText");

  // Drag-to-scroll for tab bar
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);

  const handleTabMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    setDragStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setDragScrollLeft(tabsScrollRef.current.scrollLeft);
    tabsScrollRef.current.style.cursor = "grabbing";
  };
  const handleTabMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - dragStartX) * 2;
    tabsScrollRef.current.scrollLeft = dragScrollLeft - walk;
  };
  const handleTabMouseUpOrLeave = () => {
    setIsDragging(false);
    if (tabsScrollRef.current) tabsScrollRef.current.style.cursor = "grab";
  };

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => { setIsMounted(true); }, []);

  // ── Panel resize ───────────────────────────────────────────────────────────
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => setIsResizing(false), []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = (e.clientX / window.innerWidth) * 100;
        if (newWidth >= 20 && newWidth <= 50) setLeftPanelWidth(newWidth);
      }
    },
    [isResizing],
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    } else {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (!isMounted) return null;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const updateFont = (
    key: keyof IslamicCardFontStyles,
    field: string,
    value: string,
  ) => {
    setFontStyles((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const updateVis = (
    key: keyof IslamicCardVisibilitySettings,
    value: boolean,
  ) => {
    setVisibilitySettings((prev) => ({ ...prev, [key]: value }));
  };

  const addFooterItem = () =>
    setFooterItems((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "facebook" as FooterItemType, value: "" },
    ]);

  const removeFooterItem = (id: string) =>
    setFooterItems((prev) => prev.filter((item) => item.id !== id));

  const updateFooterItem = (id: string, field: string, value: string) =>
    setFooterItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="h-screen bg-white flex flex-col">
        <Navbar />

        <div className="flex-1 flex flex-col md:flex-row md:min-h-0">
          {/* ── Free plan gate ── */}
          {user?.plan === "Free" && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border-4 border-[#8b6834] p-8 max-w-md text-center shadow-2xl">
                <div className="mb-4 flex justify-center">
                  <div className="p-4 bg-[#f5f0e8] rounded-full">
                    <svg className="w-12 h-12 text-[#8b6834]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-lora font-bold text-[#2c2419] mb-3">Islamic Cards Locked</h3>
                <p className="text-[#5d4e37] font-inter mb-6">
                  Islamic cards are available for Basic and Premium users. Upgrade your plan to unlock this feature.
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="px-8 py-3 bg-[#8b6834] text-[#faf8f5] font-inter font-medium hover:bg-[#6b4e25] transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* ── Left sidebar ── */}
          <div
            className="w-full bg-[#f5f0e8] flex flex-col overflow-y-auto md:overflow-hidden md:min-h-0 max-h-[45vh] md:max-h-none"
            style={isDesktop ? { width: `${leftPanelWidth}%` } : undefined}
          >
            {/* Page title */}
            <div className="shrink-0 px-4 pt-4 mb-4 md:px-5 md:pt-5">
              <h1 className="text-sm font-bold text-[#3d2f1f] font-dm-sans">
                Hadis Card
              </h1>
              <p className="text-[11px] text-[#8b7055] mt-0.5">
                448 × auto · Classic Islamic
              </p>
            </div>

            {/* Panel */}
            <div className="flex-1 md:min-h-0 md:overflow-hidden px-4 pb-4 md:px-5 md:pb-5">
              <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0] flex flex-col h-full md:min-h-0">

                {/* Tab bar — matches ThumbnailCustomizationPanel exactly */}
                <div className="relative mb-6 -mx-6 flex-shrink-0">
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f0e8] to-transparent z-10 pointer-events-none" />
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f0e8] to-transparent z-10 pointer-events-none" />
                  <div
                    ref={tabsScrollRef}
                    className="px-6 overflow-x-auto no-scrollbar scroll-smooth cursor-grab select-none"
                    onMouseDown={handleTabMouseDown}
                    onMouseMove={handleTabMouseMove}
                    onMouseUp={handleTabMouseUpOrLeave}
                    onMouseLeave={handleTabMouseUpOrLeave}
                  >
                    <div className="flex gap-1 min-w-max border-b-2 border-[#d4c4b0]">
                      {(["Theme", "Uploads", "Content", "Fonts", "Visibility", "Footer"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-3 text-sm font-medium font-inter transition-all relative whitespace-nowrap ${
                            activeTab === tab
                              ? "text-[#2c2419] bg-[#e8dcc8]"
                              : "text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#faf8f5]"
                          }`}
                        >
                          {tab}
                          {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b6834]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto space-y-3 md:min-h-0 no-scrollbar">

              {/* ── Theme ── */}
              {activeTab === "Theme" && (
                <div>
                  <div className="grid grid-cols-2 gap-4">
                  {ISLAMIC_THEMES.map((theme) => (
                    <div key={theme.id} className="flex flex-col">
                      <button
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`w-full transition-all duration-200 border-2 overflow-hidden cursor-pointer ${
                          selectedTheme === theme.id
                            ? "border-[#8b6834] shadow-lg shadow-[#8b6834]/30"
                            : "border-[#d4c4b0] hover:border-[#8b6834] hover:shadow-md"
                        }`}
                      >
                        <div className="relative w-full h-36 bg-[#f5f0e8]">
                          <img
                            src={theme.preview}
                            alt={theme.name}
                            className="w-full h-full object-contain"
                          />
                          {selectedTheme === theme.id && (
                            <div className="absolute bottom-0 left-0 right-0 w-full bg-[#8b6834] py-0.5 text-center">
                              <span className="text-[#faf8f5] text-sm font-inter font-semibold">Selected</span>
                            </div>
                          )}
                        </div>
                      </button>
                      <div className="mt-2 text-center text-sm font-medium font-inter text-[#2c2419]">
                        {theme.name}
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              )}

              {/* ── Uploads ── */}
              {activeTab === "Uploads" && (
                <div className="space-y-3">
                  <label className="flex items-center justify-center gap-3 min-h-[90px] border-2 border-dashed border-[#d4c4b0] bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors cursor-pointer p-4">
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    {logo ? <Edit className="w-5 h-5 text-[#8b6834]" /> : <Upload className="w-5 h-5 text-[#5d4e37]" />}
                    <span className={`font-inter font-medium text-base ${logo ? "text-[#2c2419]" : "text-[#5d4e37]"}`}>
                      {logo ? "Change Logo" : "Upload Logo"}
                    </span>
                  </label>
                  {logo && (
                    <button
                      onClick={() => setLogo("")}
                      className="text-sm text-red-600 hover:text-red-800 font-inter underline w-full text-center"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              )}

              {/* ── Content ── */}
              {activeTab === "Content" && (
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-semibold font-inter text-[#5d4e37] mb-2 block">Narrator</label>
                    <input
                      type="text"
                      value={narrator}
                      onChange={(e) => setNarrator(e.target.value)}
                      placeholder="যেমন: রাসুলুল্লাহ ﷺ বলেছেন:"
                      className="w-full px-3 py-2.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:border-[#8b6834] text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold font-inter text-[#5d4e37] mb-2 block">Hadis Text</label>
                    <textarea
                      value={hadisText}
                      onChange={(e) => setHadisText(e.target.value)}
                      placeholder="এখানে হাদিসের মূল পাঠ্য লিখুন..."
                      rows={7}
                      className="w-full px-3 py-2.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:border-[#8b6834] resize-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold font-inter text-[#5d4e37] mb-2 block">Source / Reference</label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="যেমন: সহীহ বুখারী: ৫৩৫৩"
                      className="w-full px-3 py-2.5 bg-[#faf8f5] border-2 border-[#d4c4b0] text-[#2c2419] placeholder-[#5d4e37] focus:outline-none focus:border-[#8b6834] text-sm"
                    />
                  </div>
                </div>
              )}

              {/* ── Fonts ── */}
              {activeTab === "Fonts" && (
                <div className="space-y-2">
                  {([
                    { key: "narrator" as keyof IslamicCardFontStyles, label: "NARRATOR", sizeMin: 10, sizeMax: 30 },
                    { key: "hadisText" as keyof IslamicCardFontStyles, label: "HADIS TEXT", sizeMin: 14, sizeMax: 48 },
                    { key: "source" as keyof IslamicCardFontStyles, label: "SOURCE", sizeMin: 10, sizeMax: 24 },
                  ]).map((section) => {
                    const fs = fontStyles[section.key];
                    const sizeNum = parseInt(fs.fontSize);
                    const pct = ((sizeNum - section.sizeMin) / (section.sizeMax - section.sizeMin)) * 100;
                    const isOpen = expandedFontSection === section.key;
                    return (
                      <div key={section.key} className="border border-[#d4c4b0] overflow-hidden">
                        <button
                          onClick={() => setExpandedFontSection(isOpen ? null : section.key)}
                          className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
                        >
                          <span className="text-xs font-bold text-[#2c2419] tracking-wide">{section.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-[#5d4e37]">{fs.fontSize} · {fs.fontFamily.split(" ")[0]}</span>
                            <svg className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Family</span>
                              <div className="flex gap-1 flex-1">
                                {BANGLA_FONTS.map((f) => (
                                  <button key={f.id} onClick={() => updateFont(section.key, "fontFamily", f.id)}
                                    className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${fs.fontFamily === f.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                                    {f.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Size</span>
                              <input type="range" min={section.sizeMin} max={section.sizeMax} value={sizeNum}
                                onChange={(e) => updateFont(section.key, "fontSize", `${e.target.value}px`)}
                                className="flex-1 h-1 appearance-none cursor-pointer"
                                style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${pct}%, #e8dcc8 ${pct}%, #e8dcc8 100%)` }}
                              />
                              <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">{fs.fontSize}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Weight</span>
                              <div className="flex gap-1 flex-1">
                                {WEIGHT_CHIPS.map(({ label: wl, value: wv }) => (
                                  <button key={wv} onClick={() => updateFont(section.key, "fontWeight", wv)}
                                    className={`flex-1 py-1 text-[10px] font-bold border transition-all ${fs.fontWeight === wv ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                                    {wl}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Color</span>
                              <input type="color" value={fs.color} onChange={(e) => updateFont(section.key, "color", e.target.value)}
                                className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0" />
                              <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                                <input type="text" value={fs.color.toUpperCase()} maxLength={7}
                                  onChange={(e) => {
                                    let v = e.target.value.toUpperCase();
                                    if (!v.startsWith("#")) v = "#" + v.replace(/[^0-9A-F]/g, "");
                                    else v = "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                                    v = v.slice(0, 7);
                                    if (v.length === 7) updateFont(section.key, "color", v);
                                  }}
                                  className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Align</span>
                              <div className="flex gap-1">
                                {(["left", "center", "right"] as const).map((align) => (
                                  <button key={align} onClick={() => updateFont(section.key, "textAlign", align)}
                                    className={`w-7 h-7 flex items-center justify-center border transition-all ${fs.textAlign === align ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#5d4e37] hover:border-[#8b6834]"}`}>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      {align === "left" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />}
                                      {align === "center" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />}
                                      {align === "right" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />}
                                    </svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── Visibility ── */}
              {activeTab === "Visibility" && (
                <div className="space-y-3">
                  {([
                    { key: "showLogo", label: "Logo" },
                    { key: "showNarrator", label: "Narrator" },
                    { key: "showSource", label: "Source" },
                    { key: "showFooter", label: "Social Footer" },
                  ] as { key: keyof IslamicCardVisibilitySettings; label: string }[]).map(({ key, label }) => (
                    <div key={key} className="bg-[#e8dcc8] border-2 border-[#d4c4b0] px-4 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings[key] ? (
                          <Eye className="w-4 h-4 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-semibold font-inter text-[#2c2419]">{label}</span>
                      </div>
                      <SquareToggle
                        value={visibilitySettings[key]}
                        onChange={(v) => {
                          updateVis(key, v);
                          if (key === "showFooter" && v) setActiveTab("Footer");
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* ── Footer ── */}
              {activeTab === "Footer" && (
                <div className="space-y-5">
                  {/* Footer on/off toggle */}
                  <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {visibilitySettings.showFooter ? (
                        <Eye className="w-4 h-4 text-[#8b6834]" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-[#5d4e37]" />
                      )}
                      <span className="text-sm font-semibold font-inter text-[#2c2419]">Show Footer</span>
                    </div>
                    <SquareToggle
                      value={visibilitySettings.showFooter}
                      onChange={(v) => updateVis("showFooter", v)}
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold font-inter text-[#5d4e37]">Opacity</label>
                      <span className="text-sm font-bold text-[#8b6834] bg-[#faf8f5] border border-[#d4c4b0] px-2 py-0.5">{footerOpacity}%</span>
                    </div>
                    <input
                      type="range" min={10} max={100} value={footerOpacity}
                      onChange={(e) => setFooterOpacity(Number(e.target.value))}
                      className="w-full h-1.5 appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((footerOpacity - 10) / 90) * 100}%, #d4c4b0 ${((footerOpacity - 10) / 90) * 100}%, #d4c4b0 100%)` }}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold font-inter text-[#5d4e37] mb-2 block">Icon Style</label>
                    <div className="flex gap-2">
                      {(["white", "colored"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setFooterIconColor(c)}
                          className={`flex-1 py-2.5 text-sm font-inter font-medium border-2 capitalize transition-colors ${
                            footerIconColor === c
                              ? "bg-[#8b6834] text-white border-[#8b6834]"
                              : "bg-[#faf8f5] text-[#5d4e37] border-[#d4c4b0] hover:border-[#8b6834]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#2c2419] font-inter">Footer Items</p>
                      <span className="text-xs text-[#8b7055]">{footerItems.length}/3</span>
                    </div>
                    {footerItems.length > 0 && (
                      <FooterItemsList
                        footerItems={footerItems}
                        onFooterItemsChange={setFooterItems}
                      />
                    )}
                    {footerItems.length === 0 && (
                      <p className="text-xs text-[#8b7055] font-inter text-center py-2">
                        No items yet. Add up to 3 social, website, or text entries.
                      </p>
                    )}
                    {footerItems.length < 3 && (
                      <FooterItemForm
                        onAdd={(item) => setFooterItems((prev) => [...prev, item])}
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-20 shrink-0">Text Color</span>
                    <input type="color" value={fontStyles.footer.color}
                      onChange={(e) => updateFont("footer", "color", e.target.value)}
                      className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0" />
                    <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                      <input type="text" value={fontStyles.footer.color.toUpperCase()} maxLength={7}
                        onChange={(e) => {
                          let v = e.target.value.toUpperCase();
                          if (!v.startsWith("#")) v = "#" + v.replace(/[^0-9A-F]/g, "");
                          else v = "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                          v = v.slice(0, 7);
                          if (v.length === 7) updateFont("footer", "color", v);
                        }}
                        className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none" />
                    </div>
                  </div>
                </div>
              )}

                </div>{/* end tab content */}
              </div>{/* end panel border box */}
            </div>{/* end px-6 py-6 */}
          </div>{/* end sidebar */}

          {/* ── Resize handle ── */}
          {isDesktop && (
            <div
              onMouseDown={startResizing}
              className="w-1 bg-[#d4c4b0] cursor-col-resize hover:bg-[#8b6834] transition-colors hidden md:block"
            />
          )}

          {/* ── Right canvas ── */}
          <DotBackground className="flex-1 bg-[#faf8f5] md:overflow-y-auto md:min-h-0">
            <div className="flex items-start justify-center p-4 md:pl-12 md:pr-8 md:py-8 w-full h-full">
              <div className="w-full flex justify-center">
                <div className="flex flex-col items-center gap-6 mt-12">
                  {selectedTheme === "split" ? (
                    <SplitIslamicCard
                      id="photocard-islamic"
                      fullSize
                      logo={logo}
                      narrator={narrator}
                      hadisText={hadisText}
                      source={source}
                      fontStyles={fontStyles}
                      visibilitySettings={visibilitySettings}
                      footerItems={footerItems}
                      footerOpacity={footerOpacity}
                      footerIconColor={footerIconColor}
                    />
                  ) : (
                    <ClassicIslamicCard
                      id="photocard-islamic"
                      fullSize
                      logo={logo}
                      narrator={narrator}
                      hadisText={hadisText}
                      source={source}
                      fontStyles={fontStyles}
                      visibilitySettings={visibilitySettings}
                      footerItems={footerItems}
                      footerOpacity={footerOpacity}
                      footerIconColor={footerIconColor}
                    />
                  )}
                  <DownloadControls
                    isVisible={!!(narrator || hadisText)}
                    targetId="photocard-islamic"
                  />
                </div>
              </div>
            </div>
          </DotBackground>
        </div>

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="Islamic Cards"
          requiredPlan="Basic"
        />
      </div>
    </ProtectedRoute>
  );
}
