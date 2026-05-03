"use client";

import { useState, useRef } from "react";
import {
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
  CommentCardVisibilitySettings,
  PollCardVisibilitySettings,
  FooterItem,
  FooterItemType,
  WatermarkSettings,
} from "@/types";
import {
  Plus,
  Lock,
  RefreshCw,
  X,
  Upload,
  Eye,
  EyeOff,
  RotateCcw,
  Edit2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UpgradeModal from "./UpgradeModal";

interface CustomizationPanelProps {
  background: BackgroundOptions;
  onBackgroundChange: (background: BackgroundOptions) => void;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  onFrameChange?: (color: string, thickness: number) => void;
  adBannerImage?: string | null;
  onAdBannerChange?: (image: string | null) => void;
  adBannerZoom?: number;
  onAdBannerZoomChange?: (zoom: number) => void;
  adBannerPosition?: { x: number; y: number };
  onAdBannerPositionChange?: (position: { x: number; y: number }) => void;
  theme?: string;
  onThemeChange?: (theme: string) => void;
  fontStyles?: CardFontStyles;
  onFontStylesChange?: (fontStyles: CardFontStyles) => void;
  visibilitySettings?:
    | VisibilitySettings
    | CommentCardVisibilitySettings
    | PollCardVisibilitySettings;
  onVisibilityChange?: (
    visibilitySettings:
      | VisibilitySettings
      | CommentCardVisibilitySettings
      | PollCardVisibilitySettings,
  ) => void;
  cardType?: "url" | "custom" | "comment" | "poll";
  contentLanguage?: "bangla" | "english";
  footerItems?: FooterItem[];
  onFooterItemsChange?: (items: FooterItem[]) => void;
  footerOpacity?: number;
  onFooterOpacityChange?: (v: number) => void;
  footerIconColor?: "white" | "colored";
  onFooterIconColorChange?: (v: "white" | "colored") => void;
  watermark?: WatermarkSettings;
  onWatermarkChange?: (w: WatermarkSettings) => void;
}

const SOLID_COLORS = [
  { color: "#E53E3E", name: "Soft Red" },
  { color: "#c70001", name: "Muted Gray" },
  { color: "#DD6B20", name: "Warm Orange" },
];

const GRADIENTS = [
  { from: "#C53030", to: "#FC8181", name: "Soft Red Glow" },
  { from: "#B83280", to: "#F687B3", name: "Rose Pink" },
  { from: "#C05621", to: "#F6AD55", name: "Warm Sunset" },
];

const FRAME_COLORS = [
  { color: "#E53E3E", name: "Saddle Brown" },
  { color: "#FFFFFF", name: "Pure White" },
  { color: "#000000", name: "Black" },
  { color: "#3B82F6", name: "Clean Blue" },
];

type Tab =
  | "Background"
  | "Pattern"
  | "Theme"
  | "Fonts"
  | "Visibility"
  | "Frame"
  | "Ad Banner"
  | "Footer";

const PATTERNS = [
  { id: "none", name: "None" },
  { id: "p1", name: "Pattern 1" },
  { id: "p2", name: "Pattern 2" },
  { id: "custom", name: "Upload" },
];

const BANGLA_FONTS = [
  { id: "Noto Serif Bengali", name: "Noto Serif" },
  { id: "Hind Siliguri", name: "Hind Siliguri" },
  { id: "Tiro Bangla", name: "Tiro Bangla" },
];

const ENGLISH_FONTS = [
  { id: "Playfair Display", name: "Playfair" },
  { id: "Oswald", name: "Oswald" },
  { id: "Merriweather", name: "Merriweather" },
];

const FOOTER_PLATFORMS: { id: FooterItemType; icon: React.ReactNode }[] = [
  {
    id: "facebook",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: "instagram",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    id: "youtube",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: "twitter",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "tiktok",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" />
      </svg>
    ),
  },
  {
    id: "website",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
        />
      </svg>
    ),
  },
  {
    id: "text",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
];

function FooterItemsList({
  footerItems,
  onFooterItemsChange,
}: {
  footerItems: FooterItem[];
  onFooterItemsChange?: (items: FooterItem[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {footerItems.map((item) =>
        editingId === item.id ? (
          <FooterItemForm
            key={item.id}
            initialType={item.type}
            initialValue={item.value}
            onAdd={(updated) => {
              onFooterItemsChange?.(
                footerItems.map((i) =>
                  i.id === item.id ? { ...updated, id: item.id } : i,
                ),
              );
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <div
            key={item.id}
            className="flex items-center gap-2 border border-[#d4c4b0] bg-white px-3 py-2"
          >
            <span className="text-lg leading-none shrink-0">
              {item.type === "facebook" && (
                <svg
                  className="w-4 h-4 text-[#1877f2]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
              {item.type === "instagram" && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <defs>
                    <radialGradient id="ig1" cx="30%" cy="107%" r="1.5">
                      <stop offset="0%" stopColor="#ffd676" />
                      <stop offset="10%" stopColor="#f9a12e" />
                      <stop offset="50%" stopColor="#e1306c" />
                      <stop offset="90%" stopColor="#833ab4" />
                    </radialGradient>
                  </defs>
                  <rect width="24" height="24" rx="6" fill="url(#ig1)" />
                  <rect
                    x="6.5"
                    y="6.5"
                    width="11"
                    height="11"
                    rx="3"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="2.8"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <circle cx="16.3" cy="7.7" r="0.8" fill="#fff" />
                </svg>
              )}
              {item.type === "youtube" && (
                <svg
                  className="w-4 h-4 text-[#ff0000]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              )}
              {item.type === "twitter" && (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              )}
              {item.type === "tiktok" && (
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" />
                </svg>
              )}
              {item.type === "website" && (
                <svg
                  className="w-4 h-4 text-[#8b6834]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                  />
                </svg>
              )}
              {item.type === "text" && (
                <span className="text-xs font-bold text-[#8b7055]">T</span>
              )}
            </span>
            <span className="flex-1 text-xs font-medium text-[#2c2419] truncate">
              {item.value}
            </span>
            <button
              onClick={() => setEditingId(item.id)}
              className="shrink-0 text-[#8b6834] hover:text-[#6b4f28] transition-colors"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onFooterItemsChange?.(
                  footerItems.filter((i) => i.id !== item.id),
                )
              }
              className="shrink-0 text-red-400 hover:text-red-600 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ),
      )}
    </div>
  );
}

function FooterItemForm({
  onAdd,
  onCancel,
  initialType,
  initialValue,
}: {
  onAdd: (item: FooterItem) => void;
  onCancel?: () => void;
  initialType?: FooterItemType;
  initialValue?: string;
}) {
  const [type, setType] = useState<FooterItemType>(initialType ?? "facebook");
  const [value, setValue] = useState(initialValue ?? "");

  const placeholder =
    type === "website"
      ? "www.example.com"
      : type === "text"
        ? "Any text..."
        : "@username";

  return (
    <div className="border border-dashed border-[#d4c4b0] p-3 space-y-2">
      <p className="text-xs font-semibold text-[#2c2419]">Add Item</p>
      {/* Platform icon buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {FOOTER_PLATFORMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setType(p.id)}
            title={p.id.charAt(0).toUpperCase() + p.id.slice(1)}
            className={`p-2 w-9 h-9 flex items-center justify-center transition-all border ${
              type === p.id
                ? "bg-[#8b6834] text-white border-[#8b6834]"
                : "bg-white text-[#5d4e37] border-[#d4c4b0] hover:bg-[#f5f0e8]"
            }`}
          >
            {p.icon}
          </button>
        ))}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full text-xs border border-[#d4c4b0] bg-white text-[#2c2419] px-2 py-2 outline-none"
      />
      <button
        onClick={() => {
          if (!value.trim()) return;
          onAdd({ id: Date.now().toString(), type, value: value.trim() });
          setValue("");
          onCancel?.();
        }}
        className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#8b6834] text-white text-xs font-bold hover:bg-[#6b4f28] transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> {onCancel ? "Save" : "Add"}
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-1.5 text-xs text-[#8b7055] hover:text-[#2c2419] transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function CustomizationPanel({
  background,
  onBackgroundChange,
  frameBorderColor: initialFrameBorderColor = "#FFFFFF",
  frameBorderThickness: initialFrameBorderThickness = 2,
  onFrameChange,
  adBannerImage,
  onAdBannerChange,
  adBannerZoom = 100,
  onAdBannerZoomChange,
  adBannerPosition = { x: 0, y: 0 },
  onAdBannerPositionChange,
  theme = "classic",
  onThemeChange,
  fontStyles,
  onFontStylesChange,
  visibilitySettings,
  onVisibilityChange,
  cardType = "url",
  contentLanguage = "bangla",
  footerItems = [],
  onFooterItemsChange,
  footerOpacity = 100,
  onFooterOpacityChange,
  footerIconColor = "white",
  onFooterIconColorChange,
  watermark,
  onWatermarkChange,
}: CustomizationPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("Theme");
  const [selectedTheme, setSelectedTheme] = useState(theme);
  const [showFontModal, setShowFontModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [selectedFontType, setSelectedFontType] = useState<
    "weekDate" | "headline" | null
  >(null);
  const [expandedFontSection, setExpandedFontSection] = useState<string | null>(
    cardType === "comment" ? "commentText" : "headline",
  );

  // Custom colors state
  const [customSolidColors, setCustomSolidColors] = useState<string[]>([]);
  const [customGradients, setCustomGradients] = useState<
    Array<{ from: string; to: string }>
  >([]);
  const [showSolidColorPicker, setShowSolidColorPicker] = useState(false);
  const [showGradientColorPicker, setShowGradientColorPicker] = useState(false);
  const [tempSolidColor, setTempSolidColor] = useState("#000000");
  const [tempGradientFrom, setTempGradientFrom] = useState("#000000");
  const [tempGradientTo, setTempGradientTo] = useState("#FFFFFF");
  const [editingColorIndex, setEditingColorIndex] = useState<number | null>(
    null,
  );

  // Frame color picker state
  const [showFrameColorPicker, setShowFrameColorPicker] = useState(false);
  const [tempFrameColor, setTempFrameColor] = useState("#000000");

  // Drag to scroll state
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setScrollLeft(tabsScrollRef.current.scrollLeft);
    tabsScrollRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    tabsScrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (tabsScrollRef.current) {
      tabsScrollRef.current.style.cursor = "grab";
    }
  };
  const [frameBorderColor, setFrameBorderColor] = useState(
    initialFrameBorderColor,
  );
  const [frameBorderThickness, setFrameBorderThickness] = useState(
    initialFrameBorderThickness,
  );

  const isFreeUser = !user?.plan || user?.plan === "Free";

  const gettingLockedCheck = (isLocked: boolean) => {
    return isLocked ? "" : "";
  };

  const THEMES_WITH_LOCK = [
    {
      id: "duo",
      name: "Duo",
      locked: false,
      thumbnail: "/themes/cus-7.png",
    },
    {
      id: "blend",
      name: "Blend",
      locked: isFreeUser,
      thumbnail: "/themes/cus-10.png",
    },
    {
      id: "source",
      name: "Source",
      locked: isFreeUser,
      thumbnail: "/themes/cus-11.png",
    },
    {
      id: "magazine",
      name: "Magazine",
      locked: isFreeUser,
      thumbnail: "/themes/cus-6.png",
    },
    {
      id: "modern",
      name: "Modern",
      locked: isFreeUser, // Lock Modern theme for Free users
      thumbnail: "/themes/cus-2.png",
    },
    {
      id: "classic",
      name: "Classic",
      locked: false,
      thumbnail: "/themes/cus-1.png",
    },
    {
      id: "banner",
      name: "Banner",
      locked: isFreeUser,
      thumbnail: "/themes/cus-9.png",
    },
    {
      id: "overlay",
      name: "Overlay",
      locked: isFreeUser,
      thumbnail: "/themes/cus-8.png",
    },
    {
      id: "modern2",
      name: "Modern 2",
      locked: isFreeUser, // Lock Modern 2 theme for Free users
      thumbnail: "/themes/cus-4.png",
    },
    {
      id: "minimal",
      name: "Minimal",
      locked: isFreeUser,
      thumbnail: "/themes/cus-5.png",
    },
    {
      id: "vertical",
      name: "Vertical",
      locked: isFreeUser, // Lock Vertical theme for Free users
      thumbnail: "/themes/cus-3.png",
    },
  ];

  const COMMENT_THEMES_WITH_LOCK = [
    {
      id: "classic",
      name: "Classic",
      locked: false,
      thumbnail: "/themes/com-1.png",
    },
    {
      id: "portrait",
      name: "Portrait",
      locked: false,
      thumbnail: "/themes/com-5.png",
    },
    {
      id: "quoteframe",
      name: "Quote Frame",
      locked: false,
      thumbnail: "/themes/com-6.png",
    },
    {
      id: "grid",
      name: "Grid",
      locked: false,
      thumbnail: "/themes/com-2.png",
    },
    {
      id: "split",
      name: "Split",
      locked: false,
      thumbnail: "/themes/com-3.png",
    },
  ];

  const POLL_THEMES_WITH_LOCK = [
    {
      id: "classic",
      name: "Classic",
      locked: false,
      thumbnail: "/themes/pol-1.png",
    },
  ];

  const activeThemes =
    cardType === "comment"
      ? COMMENT_THEMES_WITH_LOCK
      : cardType === "poll"
        ? POLL_THEMES_WITH_LOCK
        : THEMES_WITH_LOCK;

  const handleThemeChange = (themeId: string, isLocked: boolean) => {
    if (isLocked) {
      const featureName =
        themeId === "modern"
          ? "Modern Theme"
          : themeId === "modern2"
            ? "Modern 2 Theme"
            : themeId === "minimal"
              ? "Minimal Theme"
              : themeId === "vertical"
                ? "Vertical Theme"
                : themeId === "banner"
                  ? "Banner Theme"
                  : "Premium Theme";
      setUpgradeFeature(featureName);
      setShowUpgradeModal(true);
      return;
    }
    setSelectedTheme(themeId);
    onThemeChange?.(themeId);
  };

  const handleFontsTabClick = () => {
    if (isFreeUser) {
      setUpgradeFeature("Font Customization");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab("Fonts");
  };

  const handleVisibilityTabClick = () => {
    if (isFreeUser) {
      setUpgradeFeature("Visibility Controls");
      setShowUpgradeModal(true);
      return;
    }
    setActiveTab("Visibility");
  };

  const handleFrameColorChange = (color: string) => {
    setFrameBorderColor(color);
    onFrameChange?.(color, frameBorderThickness);
  };

  const handleFrameThicknessChange = (thickness: number) => {
    setFrameBorderThickness(thickness);
    onFrameChange?.(frameBorderColor, thickness);
  };

  const tabs: Tab[] = [
    "Theme",
    "Background",
    "Fonts",
    "Pattern",
    "Ad Banner",
    "Frame",
    "Visibility",
    "Footer",
  ];

  return (
    <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0] flex flex-col h-full md:min-h-0">
      {/* Tab Navigation - Modern Scrollable with fade indicators */}
      <div className="relative mb-6 -mx-6 flex-shrink-0">
        {/* Left fade indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#f5f0e8] to-transparent z-10 pointer-events-none" />

        {/* Right fade indicator */}
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#f5f0e8] to-transparent z-10 pointer-events-none" />

        <div
          ref={tabsScrollRef}
          className="px-6 overflow-x-auto no-scrollbar scroll-smooth cursor-grab select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          <div className="flex gap-1 min-w-max border-b-2 border-[#d4c4b0]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={(e) => {
                  // Only trigger click if not dragging
                  if (isDragging) {
                    e.preventDefault();
                    return;
                  }
                  if (tab === "Fonts") {
                    handleFontsTabClick();
                  } else if (tab === "Visibility") {
                    handleVisibilityTabClick();
                  } else {
                    setActiveTab(tab);
                  }
                }}
                className={`px-4 py-3 text-sm font-medium font-inter transition-all relative whitespace-nowrap ${
                  activeTab === tab
                    ? "text-[#2c2419] bg-[#e8dcc8]"
                    : "text-[#5d4e37] hover:text-[#8b6834] hover:bg-[#faf8f5]"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {tab}
                  {tab === "Fonts" && isFreeUser && (
                    <Lock className="w-3 h-3" />
                  )}
                  {tab === "Visibility" && isFreeUser && (
                    <Lock className="w-3 h-3" />
                  )}
                </span>
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8b6834]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-3 md:min-h-0 no-scrollbar">
        {/* Background Tab */}
        {activeTab === "Background" && (
          <>
            {/* Magazine card: background palette is fixed — show locked state */}
            {theme === "magazine" && (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <Lock className="w-8 h-8 text-[#8b6834]" />
                <p className="text-sm font-semibold text-[#2c2419] font-inter">
                  Background Locked
                </p>
                <p className="text-xs text-[#5d4e37] font-inter leading-relaxed max-w-[210px]">
                  The Magazine card uses a fixed two-tone colour palette.
                  Background colours cannot be changed for this theme.
                </p>
              </div>
            )}
            {/* Normal background controls — hidden for Magazine */}
            <div className={theme === "magazine" ? "hidden" : ""}>
              {/* Solid Colors Section */}
              <div>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Solid Colors{" "}
                  <span className="text-xs text-[#5d4e37]">
                    ({SOLID_COLORS.length + customSolidColors.length}/5 colors)
                  </span>
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {/* Preset Colors */}
                  {SOLID_COLORS.map((item, index) => {
                    const isLocked = isFreeUser && index > 0;
                    return (
                      <button
                        key={item.color}
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeFeature("Premium Colors");
                            setShowUpgradeModal(true);
                            return;
                          }
                          onBackgroundChange({
                            type: "solid",
                            color: item.color,
                          });
                        }}
                        className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                          background.type === "solid" &&
                          background.color === item.color
                            ? "border-[#8b6834] shadow-md"
                            : "border-[#d4c4b0] hover:scale-95"
                        } ${gettingLockedCheck(isLocked)}`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                        {background.type === "solid" &&
                          background.color === item.color && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                              selected
                            </div>
                          )}
                      </button>
                    );
                  })}

                  {/* Custom Colors */}
                  {customSolidColors.map((color, index) => (
                    <button
                      key={`custom-${color}`}
                      onClick={() => {
                        onBackgroundChange({
                          type: "solid",
                          color: color,
                        });
                      }}
                      className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                        background.type === "solid" &&
                        background.color === color
                          ? "border-[#8b6834] shadow-md"
                          : "border-[#d4c4b0] hover:scale-95"
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {background.type === "solid" &&
                        background.color === color && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                            selected
                          </div>
                        )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingColorIndex(index);
                          setTempSolidColor(color);
                          setShowSolidColorPicker(true);
                        }}
                        className="absolute top-1 left-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10 text-[10px]"
                        title="Edit color"
                      >
                        ✎
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomSolidColors((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                        title="Remove color"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </button>
                  ))}

                  {/* Add Custom Color Button */}
                  {customSolidColors.length < 2 && (
                    <button
                      onClick={() => {
                        if (isFreeUser) {
                          setUpgradeFeature("Custom Colors");
                          setShowUpgradeModal(true);
                          return;
                        }
                        setEditingColorIndex(null);
                        setTempSolidColor("#000000");
                        setShowSolidColorPicker(!showSolidColorPicker);
                      }}
                      className={`relative w-14 h-14 flex-shrink-0 border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
                        isFreeUser
                          ? "border-[#d4c4b0] bg-[#faf8f5]"
                          : "border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8]"
                      }`}
                      title={
                        isFreeUser
                          ? "Upgrade to add custom colors"
                          : "Add custom color"
                      }
                    >
                      {isFreeUser ? (
                        <Lock className="w-5 h-5 text-[#5d4e37]" />
                      ) : (
                        <Plus className="w-5 h-5 text-[#8b6834]" />
                      )}
                    </button>
                  )}
                </div>

                {/* Color Picker Modal for Solid */}
                {showSolidColorPicker && (
                  <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-[#2c2419] font-inter">
                        {editingColorIndex !== null
                          ? "Edit Custom Color"
                          : "Pick a custom color"}
                      </label>
                      <button
                        onClick={() => {
                          setShowSolidColorPicker(false);
                          setEditingColorIndex(null);
                        }}
                        className="text-[#5d4e37] hover:text-[#2c2419]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <input
                        type="color"
                        value={tempSolidColor}
                        onChange={(e) => setTempSolidColor(e.target.value)}
                        className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                      />
                      <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                        <input
                          type="text"
                          value={tempSolidColor.toUpperCase()}
                          onChange={(e) => {
                            let value = e.target.value.toUpperCase();
                            // Always start with #
                            if (!value.startsWith("#")) {
                              value = "#" + value.replace(/[^0-9A-F]/g, "");
                            } else {
                              value =
                                "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                            }
                            value = value.slice(0, 7);
                            setTempSolidColor(value);
                          }}
                          onBlur={(e) => {
                            const value = e.target.value;
                            if (
                              value.length !== 7 ||
                              !/^#[0-9A-F]{6}$/i.test(value)
                            ) {
                              setTempSolidColor("#000000");
                            }
                          }}
                          placeholder="#000000"
                          className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                          maxLength={7}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (tempSolidColor.length === 7) {
                          if (editingColorIndex !== null) {
                            // Edit existing color
                            setCustomSolidColors((prev) =>
                              prev.map((c, i) =>
                                i === editingColorIndex ? tempSolidColor : c,
                              ),
                            );
                          } else if (
                            customSolidColors.length < 2 &&
                            !customSolidColors.includes(tempSolidColor)
                          ) {
                            // Add new color
                            setCustomSolidColors((prev) => [
                              ...prev,
                              tempSolidColor,
                            ]);
                          }
                          onBackgroundChange({
                            type: "solid",
                            color: tempSolidColor,
                          });
                          setShowSolidColorPicker(false);
                          setTempSolidColor("#000000");
                          setEditingColorIndex(null);
                        }
                      }}
                      className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                      disabled={tempSolidColor.length !== 7}
                    >
                      {editingColorIndex !== null
                        ? "Update Color"
                        : "Add Color"}
                    </button>
                  </div>
                )}
              </div>

              {/* Gradients Section */}
              <div>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Gradients{" "}
                  <span className="text-xs text-[#5d4e37]">
                    ({GRADIENTS.length + customGradients.length}/5 gradients)
                  </span>
                </h3>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {/* Preset Gradients */}
                  {GRADIENTS.map((grad, index) => {
                    const isLocked = isFreeUser;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (isLocked) {
                            setUpgradeFeature("Gradients");
                            setShowUpgradeModal(true);
                            return;
                          }
                          onBackgroundChange({
                            type: "gradient",
                            color: "",
                            gradientFrom: grad.from,
                            gradientTo: grad.to,
                          });
                        }}
                        className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                          background.type === "gradient" &&
                          background.gradientFrom === grad.from &&
                          background.gradientTo === grad.to
                            ? "border-[#8b6834] shadow-md"
                            : "border-[#d4c4b0] hover:scale-95"
                        } ${gettingLockedCheck(isLocked)}`}
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                        }}
                        title={grad.name}
                      >
                        {isLocked && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <Lock className="w-4 h-4 text-white drop-shadow-md" />
                          </div>
                        )}
                        {background.type === "gradient" &&
                          background.gradientFrom === grad.from &&
                          background.gradientTo === grad.to && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#2c2419]/70 text-[#faf8f5] text-[10px] font-inter text-center py-1">
                              selected
                            </div>
                          )}
                      </button>
                    );
                  })}

                  {/* Custom Gradients */}
                  {customGradients.map((grad, index) => (
                    <button
                      key={`custom-grad-${index}`}
                      onClick={() => {
                        onBackgroundChange({
                          type: "gradient",
                          color: "",
                          gradientFrom: grad.from,
                          gradientTo: grad.to,
                        });
                      }}
                      className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${
                        background.type === "gradient" &&
                        background.gradientFrom === grad.from &&
                        background.gradientTo === grad.to
                          ? "border-[#8b6834] shadow-md"
                          : "border-[#d4c4b0] hover:scale-95"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      }}
                    >
                      {background.type === "gradient" &&
                        background.gradientFrom === grad.from &&
                        background.gradientTo === grad.to && (
                          <div className="absolute bottom-0 left-0 right-0 bg-[#2c2419]/70 text-[#faf8f5] text-[10px] font-inter text-center py-1">
                            selected
                          </div>
                        )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCustomGradients((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-sm opacity-0 group-hover:opacity-100 z-10"
                        title="Remove gradient"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </button>
                  ))}

                  {/* Add Custom Gradient Button */}
                  {customGradients.length < 2 && (
                    <button
                      onClick={() => {
                        if (isFreeUser) {
                          setUpgradeFeature("Custom Gradients");
                          setShowUpgradeModal(true);
                          return;
                        }
                        setShowGradientColorPicker(!showGradientColorPicker);
                      }}
                      className={`relative w-14 h-14 flex-shrink-0 border-2 border-dashed transition-all overflow-hidden flex items-center justify-center ${
                        isFreeUser
                          ? "border-[#d4c4b0] bg-[#faf8f5]"
                          : "border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8]"
                      }`}
                      title={
                        isFreeUser
                          ? "Upgrade to add custom gradients"
                          : "Add custom gradient"
                      }
                    >
                      {isFreeUser ? (
                        <Lock className="w-5 h-5 text-[#5d4e37]" />
                      ) : (
                        <Plus className="w-5 h-5 text-[#8b6834]" />
                      )}
                    </button>
                  )}
                </div>

                {/* Gradient Picker Modal */}
                {showGradientColorPicker && (
                  <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-[#2c2419] font-inter">
                        Create custom gradient
                      </label>
                      <button
                        onClick={() => setShowGradientColorPicker(false)}
                        className="text-[#5d4e37] hover:text-[#2c2419]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* From Color */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                        From Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={tempGradientFrom}
                          onChange={(e) => setTempGradientFrom(e.target.value)}
                          className="h-10 w-16 border-2 border-[#d4c4b0] cursor-pointer"
                        />
                        <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-3 py-2 flex items-center">
                          <input
                            type="text"
                            value={tempGradientFrom.toUpperCase()}
                            onChange={(e) => {
                              let value = e.target.value.toUpperCase();
                              if (!value.startsWith("#")) {
                                value = "#" + value.replace(/[^0-9A-F]/g, "");
                              } else {
                                value =
                                  "#" +
                                  value.slice(1).replace(/[^0-9A-F]/g, "");
                              }
                              value = value.slice(0, 7);
                              setTempGradientFrom(value);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (
                                value.length !== 7 ||
                                !/^#[0-9A-F]{6}$/i.test(value)
                              ) {
                                setTempGradientFrom("#000000");
                              }
                            }}
                            placeholder="#000000"
                            className="w-full text-sm font-mono text-[#2c2419] bg-transparent outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>

                    {/* To Color */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                        To Color
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={tempGradientTo}
                          onChange={(e) => setTempGradientTo(e.target.value)}
                          className="h-10 w-16 border-2 border-[#d4c4b0] cursor-pointer"
                        />
                        <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-3 py-2 flex items-center">
                          <input
                            type="text"
                            value={tempGradientTo.toUpperCase()}
                            onChange={(e) => {
                              let value = e.target.value.toUpperCase();
                              if (!value.startsWith("#")) {
                                value = "#" + value.replace(/[^0-9A-F]/g, "");
                              } else {
                                value =
                                  "#" +
                                  value.slice(1).replace(/[^0-9A-F]/g, "");
                              }
                              value = value.slice(0, 7);
                              setTempGradientTo(value);
                            }}
                            onBlur={(e) => {
                              const value = e.target.value;
                              if (
                                value.length !== 7 ||
                                !/^#[0-9A-F]{6}$/i.test(value)
                              ) {
                                setTempGradientTo("#FFFFFF");
                              }
                            }}
                            placeholder="#FFFFFF"
                            className="w-full text-sm font-mono text-[#2c2419] bg-transparent outline-none"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-[#5d4e37] mb-1 block">
                        Preview
                      </label>
                      <div
                        className="w-full h-16 border-2 border-[#d4c4b0]"
                        style={{
                          backgroundImage: `linear-gradient(135deg, ${tempGradientFrom}, ${tempGradientTo})`,
                        }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        if (
                          tempGradientFrom.length === 7 &&
                          tempGradientTo.length === 7
                        ) {
                          const newGrad = {
                            from: tempGradientFrom,
                            to: tempGradientTo,
                          };
                          const exists = customGradients.some(
                            (g) =>
                              g.from === newGrad.from && g.to === newGrad.to,
                          );
                          if (!exists) {
                            setCustomGradients((prev) => [...prev, newGrad]);
                            onBackgroundChange({
                              type: "gradient",
                              color: "",
                              gradientFrom: tempGradientFrom,
                              gradientTo: tempGradientTo,
                            });
                            setShowGradientColorPicker(false);
                            setTempGradientFrom("#000000");
                            setTempGradientTo("#FFFFFF");
                          }
                        }
                      }}
                      className="w-full py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                      disabled={
                        tempGradientFrom.length !== 7 ||
                        tempGradientTo.length !== 7
                      }
                    >
                      Add Gradient
                    </button>
                  </div>
                )}
              </div>
            </div>{" "}
            {/* end: normal bg controls wrapper */}
          </>
        )}

        {/* Pattern Tab */}
        {activeTab === "Pattern" && (
          <div className="space-y-6">
            {theme === "magazine" || theme === "source" ? (
              <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-[#8b6834]"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
                <p className="text-sm font-semibold text-[#2c2419] font-inter">
                  Pattern Locked
                </p>
                <p className="text-xs text-[#5d4e37] font-inter leading-relaxed max-w-[200px]">
                  {theme === "source"
                    ? "The Source card uses a clean fixed layout without pattern controls."
                    : "The Magazine card uses a fixed built-in pattern. You cannot change it."}
                </p>
              </div>
            ) : theme === "split" ? (
              <div>
                <p className="text-xs text-[#5d4e37] font-inter mb-4 leading-relaxed">
                  The Split card uses a decorative dot pattern at the corners.
                  Adjust its opacity below.
                </p>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Dot Pattern Opacity
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={background.patternOpacity ?? 0.2}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        patternOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((background.patternOpacity ?? 0.2) - 0.05) / 0.45) * 100}%, #e8dcc8 ${(((background.patternOpacity ?? 0.2) - 0.05) / 0.45) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                  <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                    {Math.round((background.patternOpacity ?? 0.2) * 100)}%
                  </div>
                </div>
              </div>
            ) : theme === "grid" ? (
              <div>
                <p className="text-xs text-[#5d4e37] font-inter mb-4 leading-relaxed">
                  The Grid card uses a built-in grid pattern. Adjust its opacity
                  below.
                </p>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Grid Opacity
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.02"
                    max="0.4"
                    step="0.01"
                    value={background.patternOpacity ?? 0.07}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        patternOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((background.patternOpacity ?? 0.07) - 0.02) / 0.38) * 100}%, #e8dcc8 ${(((background.patternOpacity ?? 0.07) - 0.02) / 0.38) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                  <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                    {Math.round((background.patternOpacity ?? 0.07) * 100)}%
                  </div>
                </div>
              </div>
            ) : theme === "banner" ? (
              <div className="space-y-5">
                <p className="text-xs text-[#5d4e37] font-inter leading-relaxed">
                  The Banner card has a built-in grid overlay. Adjust its
                  opacity and colour below.
                </p>
                <div>
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                    Grid Opacity
                  </h3>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={background.patternOpacity ?? 0.5}
                      onChange={(e) =>
                        onBackgroundChange({
                          ...background,
                          patternOpacity: parseFloat(e.target.value),
                        })
                      }
                      className="flex-1 h-1 appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(background.patternOpacity ?? 0.5) * 100}%, #e8dcc8 ${(background.patternOpacity ?? 0.5) * 100}%, #e8dcc8 100%)`,
                      }}
                    />
                    <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                      {Math.round((background.patternOpacity ?? 0.5) * 100)}%
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                    Grid Colour
                  </h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        onBackgroundChange({
                          ...background,
                          patternColor: "#000000",
                        })
                      }
                      className={`flex-1 py-2 rounded text-sm font-semibold font-inter border-2 transition-all bg-black text-white ${
                        (background.patternColor ?? "#000000") === "#000000"
                          ? "border-[#8b6834]"
                          : "border-[#d4c4b0] opacity-50"
                      }`}
                    >
                      Black
                    </button>
                    <button
                      onClick={() =>
                        onBackgroundChange({
                          ...background,
                          patternColor: "#ffffff",
                        })
                      }
                      className={`flex-1 py-2 rounded text-sm font-semibold font-inter border-2 transition-all bg-white text-black ${
                        background.patternColor === "#ffffff"
                          ? "border-[#8b6834]"
                          : "border-[#d4c4b0] opacity-50"
                      }`}
                    >
                      White
                    </button>
                  </div>
                </div>
              </div>
            ) : theme === "duo" ? (
              <div>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Pattern Opacity
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={background.patternOpacity || 0.35}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        patternOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((background.patternOpacity || 0.35) - 0.05) / 0.75) * 100}%, #e8dcc8 ${(((background.patternOpacity || 0.35) - 0.05) / 0.75) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                  <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                    {Math.round((background.patternOpacity || 0.35) * 100)}%
                  </div>
                </div>
              </div>
            ) : theme === "portrait" ? (
              <div>
                <p className="text-xs text-[#5d4e37] font-inter mb-4 leading-relaxed">
                  The Portrait card uses a fixed lines pattern. Adjust its
                  opacity below.
                </p>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Lines Pattern Opacity
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={background.patternOpacity ?? 0.4}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        patternOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(background.patternOpacity ?? 0.4) * 100}%, #e8dcc8 ${(background.patternOpacity ?? 0.4) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                  <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                    {Math.round((background.patternOpacity ?? 0.4) * 100)}%
                  </div>
                </div>
              </div>
            ) : theme === "quoteframe" ? (
              <div>
                <p className="text-xs text-[#5d4e37] font-inter mb-4 leading-relaxed">
                  The Quote Frame card uses a fixed lines pattern. Adjust its
                  opacity below.
                </p>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                  Lines Pattern Opacity
                </h3>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={background.patternOpacity ?? 0.3}
                    onChange={(e) =>
                      onBackgroundChange({
                        ...background,
                        patternOpacity: parseFloat(e.target.value),
                      })
                    }
                    className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(background.patternOpacity ?? 0.3) * 100}%, #e8dcc8 ${(background.patternOpacity ?? 0.3) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                  <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                    {Math.round((background.patternOpacity ?? 0.3) * 100)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pattern Selection */}
                <div>
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                    {" "}
                    Select Pattern
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {PATTERNS.map((pattern) => {
                      const isLocked =
                        isFreeUser && ["custom"].includes(pattern.id);
                      const isActive = background.pattern === pattern.id;

                      return (
                        <button
                          key={pattern.id}
                          onClick={() => {
                            if (isLocked) {
                              setUpgradeFeature("Premium Patterns");
                              setShowUpgradeModal(true);
                              return;
                            }
                            onBackgroundChange({
                              ...background,
                              pattern: pattern.id as any,
                              patternOpacity: background.patternOpacity || 0.3,
                            });
                          }}
                          className={`aspect-square flex flex-col items-center justify-center p-2 border-2 transition-all overflow-hidden relative ${
                            isActive
                              ? "border-[#8b6834] bg-[#e8dcc8]"
                              : "border-[#d4c4b0] bg-[#faf8f5] hover:border-[#8b6834]"
                          } ${gettingLockedCheck(isLocked)}`}
                        >
                          {/* Visual Preview */}
                          <div className="w-full h-full mb-1 border border-black/5 overflow-hidden bg-white/50 relative">
                            {pattern.id === "none" && (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                                None
                              </div>
                            )}
                            {pattern.id === "custom" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Upload className="w-4 h-4 text-[#5d4e37]" />
                              </div>
                            )}

                            {/* Image Previews for Patterns */}
                            {pattern.id === "p1" && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: "url(/patterns/p1-t.png)",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            )}
                            {pattern.id === "p2" && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundImage: "url(/patterns/p2-t.png)",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            )}

                            {/* Lock Overlay for restricted patterns */}
                            {isLocked && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                                <Lock className="w-5 h-5 text-white drop-shadow-md" />
                              </div>
                            )}
                          </div>

                          <span
                            className={`text-[10px] font-medium leading-tight ${isActive ? "text-[#2c2419]" : "text-[#5d4e37]"}`}
                          >
                            {pattern.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom File Upload Input */}
                {background.pattern === "custom" && (
                  <div className="bg-[#e8dcc8] p-4 border border-[#d4c4b0]">
                    <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-2">
                      Upload Pattern Image
                    </h3>
                    <label className="block border-2 border-dashed border-[#8b6834]/50 bg-[#faf8f5] hover:bg-white transition-colors cursor-pointer p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              onBackgroundChange({
                                ...background,
                                patternImage: reader.result as string,
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <Upload className="w-5 h-5 mx-auto mb-2 text-[#8b6834]" />
                      <p className="text-xs text-[#5d4e37] font-medium">
                        Click to upload image
                      </p>
                      <p className="text-[10px] text-[#5d4e37]/70 mt-1">
                        Supports PNG, JPG (will be used as overlay)
                      </p>
                    </label>
                    {background.patternImage && (
                      <div className="mt-2 text-xs text-green-700 flex items-center gap-1 font-medium">
                        <div className="w-2 h-2 bg-green-500" /> Image loaded
                        successfully
                      </div>
                    )}
                  </div>
                )}

                {/* Pattern Color & Opacity - Only show if pattern is selected and NOT custom/none */}
                {background.pattern && background.pattern !== "none" && (
                  <>
                    {/* Opacity Slider - Available for Custom too */}
                    <div>
                      <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                        Opacity
                      </h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="0.05"
                          max="0.8"
                          step="0.05"
                          value={background.patternOpacity || 0.3}
                          onChange={(e) =>
                            onBackgroundChange({
                              ...background,
                              patternOpacity: parseFloat(e.target.value),
                            })
                          }
                          className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((background.patternOpacity || 0.3) - 0.05) / 0.75) * 100}%, #e8dcc8 ${(((background.patternOpacity || 0.3) - 0.05) / 0.75) * 100}%, #e8dcc8 100%)`,
                          }}
                        />
                        <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                          {Math.round((background.patternOpacity || 0.3) * 100)}
                          %
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            {/* ── Brand Watermark ── */}
            {cardType === "url" && (
              <div className="space-y-4 border-t border-[#e8dcc8] pt-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#2c2419] font-inter">
                    Brand Watermark
                  </h3>
                  <button
                    onClick={() =>
                      onWatermarkChange?.({
                        ...(watermark ?? {
                          text: "",
                          opacity: 0.3,
                          x: 0,
                          y: 0,
                          fontSize: 48,
                          rotation: 0,
                          enabled: true,
                        }),
                        enabled: !(watermark?.enabled ?? true),
                      })
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      (watermark?.enabled ?? true)
                        ? "bg-[#8b6834]"
                        : "bg-[#d4c4b0]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        (watermark?.enabled ?? true) ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#5d4e37] font-inter">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={watermark?.text || ""}
                    onChange={(e) =>
                      onWatermarkChange?.({
                        ...(watermark ?? {
                          text: "",
                          opacity: 0.3,
                          x: 0,
                          y: 0,
                          fontSize: 48,
                          rotation: 0,
                        }),
                        text: e.target.value,
                      })
                    }
                    placeholder="Your brand name..."
                    className="w-full px-3 py-2 text-sm border border-[#d4c4b0] bg-[#faf8f5] text-[#2c2419] font-inter focus:outline-none focus:border-[#8b6834]"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[#5d4e37] font-inter">
                      Opacity
                    </label>
                    <span className="text-xs font-bold text-[#8b6834]">
                      {Math.round((watermark?.opacity ?? 0.3) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="10"
                    value={Math.round((watermark?.opacity ?? 0.3) * 100)}
                    onChange={(e) =>
                      onWatermarkChange?.({
                        ...(watermark ?? {
                          text: "",
                          opacity: 0.3,
                          x: 0,
                          y: 0,
                          fontSize: 48,
                          rotation: 0,
                        }),
                        opacity: Number(e.target.value) / 100,
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((Math.round((watermark?.opacity ?? 0.3) * 100) - 10) / 90) * 100}%, #e8dcc8 ${((Math.round((watermark?.opacity ?? 0.3) * 100) - 10) / 90) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[#5d4e37] font-inter">
                      Text Size
                    </label>
                    <span className="text-xs font-bold text-[#8b6834]">
                      {watermark?.fontSize ?? 48}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    step="10"
                    value={watermark?.fontSize ?? 48}
                    onChange={(e) =>
                      onWatermarkChange?.({
                        ...(watermark ?? {
                          text: "",
                          opacity: 0.3,
                          x: 0,
                          y: 0,
                          fontSize: 48,
                          rotation: 0,
                        }),
                        fontSize: Number(e.target.value),
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((watermark?.fontSize ?? 48) - 20) / 100) * 100}%, #e8dcc8 ${(((watermark?.fontSize ?? 48) - 20) / 100) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs text-[#5d4e37] font-inter">
                      Angle
                    </label>
                    <span className="text-xs font-bold text-[#8b6834]">
                      {watermark?.rotation ?? 0}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    step="10"
                    value={watermark?.rotation ?? 0}
                    onChange={(e) =>
                      onWatermarkChange?.({
                        ...(watermark ?? {
                          text: "",
                          opacity: 0.3,
                          x: 0,
                          y: 0,
                          fontSize: 48,
                          rotation: 0,
                        }),
                        rotation: Number(e.target.value),
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((watermark?.rotation ?? 0) + 90) / 180) * 100}%, #e8dcc8 ${(((watermark?.rotation ?? 0) + 90) / 180) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-[#5d4e37] font-inter">
                        Move Left / Right
                      </label>
                      <span className="text-xs font-bold text-[#8b6834]">
                        {(watermark?.x ?? 0) > 0 ? "+" : ""}
                        {watermark?.x ?? 0}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      step="10"
                      value={watermark?.x ?? 0}
                      onChange={(e) =>
                        onWatermarkChange?.({
                          ...(watermark ?? {
                            text: "",
                            opacity: 0.3,
                            x: 0,
                            y: 0,
                            fontSize: 48,
                            rotation: 0,
                          }),
                          x: Number(e.target.value),
                        })
                      }
                      className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((watermark?.x ?? 0) + 200) / 4}%, #e8dcc8 ${((watermark?.x ?? 0) + 200) / 4}%, #e8dcc8 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-[#9d8c7a] font-inter">
                      <span>← Left</span>
                      <span>Right →</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs text-[#5d4e37] font-inter">
                        Move Up / Down
                      </label>
                      <span className="text-xs font-bold text-[#8b6834]">
                        {watermark?.y ?? 100}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      step="10"
                      value={watermark?.y ?? 100}
                      onChange={(e) =>
                        onWatermarkChange?.({
                          ...(watermark ?? {
                            text: "",
                            opacity: 0.3,
                            x: 0,
                            y: 0,
                            fontSize: 48,
                            rotation: 0,
                          }),
                          y: Number(e.target.value),
                        })
                      }
                      className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((watermark?.y ?? 100) / 500) * 100}%, #e8dcc8 ${((watermark?.y ?? 100) / 500) * 100}%, #e8dcc8 100%)`,
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-[#9d8c7a] font-inter">
                      <span>↓ Bottom</span>
                      <span>Top ↑</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === "Theme" && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {activeThemes.map((theme) => (
                <div key={theme.id} className="flex flex-col">
                  <button
                    onClick={() => handleThemeChange(theme.id, theme.locked)}
                    className={`w-full transition-all duration-200 border-2 overflow-hidden ${
                      selectedTheme === theme.id && !theme.locked
                        ? "border-[#8b6834] shadow-lg shadow-[#8b6834]/30"
                        : "border-[#d4c4b0] hover:border-[#8b6834] hover:shadow-md"
                    } ${theme.locked ? "opacity-80 cursor-pointer" : "cursor-pointer"}`}
                  >
                    <div className="relative w-full h-36 bg-[#f5f0e8]">
                      <img
                        src={theme.thumbnail}
                        alt={theme.name}
                        className="w-full h-full object-contain"
                      />

                      {theme.locked && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      )}

                      {/* Selected indicator at bottom inside the image area */}
                      {selectedTheme === theme.id && !theme.locked && (
                        <div className="absolute bottom-0 left-0 right-0 w-full bg-[#8b6834] py-0.5 text-center">
                          <span className="text-[#faf8f5] text-sm font-inter font-semibold">
                            Selected
                          </span>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Theme Name outside box below */}
                  <div className="mt-2 text-center text-sm font-medium font-inter text-[#2c2419]">
                    {theme.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fonts Tab - Accordion Design */}
        {activeTab === "Fonts" && fontStyles && onFontStylesChange && (
          <div className="space-y-2">
            {/* Comment-Specific Sections (first for comment cards) */}
            {cardType === "comment" && (
              <>
                {fontStyles.commentText && (
                  <div className="border border-[#d4c4b0] overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedFontSection(
                          expandedFontSection === "commentText"
                            ? null
                            : "commentText",
                        )
                      }
                      className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
                    >
                      <span className="text-xs font-bold text-[#2c2419] tracking-wide">
                        COMMENT TEXT
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#5d4e37]">
                          {fontStyles.commentText.fontSize} ·{" "}
                          {fontStyles.commentText.fontFamily.split(" ")[0]}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${expandedFontSection === "commentText" ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    {expandedFontSection === "commentText" && (
                      <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Font
                          </span>
                          <div className="flex gap-1 flex-1">
                            {(contentLanguage === "english"
                              ? ENGLISH_FONTS
                              : BANGLA_FONTS
                            ).map((font) => (
                              <button
                                key={font.id}
                                onClick={() =>
                                  onFontStylesChange({
                                    ...fontStyles,
                                    commentText: {
                                      ...fontStyles.commentText!,
                                      fontFamily: font.id,
                                    },
                                  })
                                }
                                className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${fontStyles.commentText!.fontFamily === font.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                              >
                                {font.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Size
                          </span>
                          <input
                            type="range"
                            min="16"
                            max="56"
                            value={parseInt(fontStyles.commentText!.fontSize)}
                            onChange={(e) =>
                              onFontStylesChange({
                                ...fontStyles,
                                commentText: {
                                  ...fontStyles.commentText!,
                                  fontSize: `${e.target.value}px`,
                                },
                              })
                            }
                            className="flex-1 h-1 appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.commentText!.fontSize) - 16) / 40) * 100}%, #e8dcc8 ${((parseInt(fontStyles.commentText!.fontSize) - 16) / 40) * 100}%, #e8dcc8 100%)`,
                            }}
                          />
                          <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">
                            {fontStyles.commentText!.fontSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Weight
                          </span>
                          <div className="flex gap-1 flex-1">
                            {(
                              [
                                ["400", "N"],
                                ["500", "M"],
                                ["600", "S"],
                                ["700", "B"],
                                ["800", "XB"],
                              ] as const
                            ).map(([w, l]) => (
                              <button
                                key={w}
                                onClick={() =>
                                  onFontStylesChange({
                                    ...fontStyles,
                                    commentText: {
                                      ...fontStyles.commentText!,
                                      fontWeight: w,
                                    },
                                  })
                                }
                                className={`flex-1 py-1 text-[10px] font-bold border transition-all ${fontStyles.commentText!.fontWeight === w ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Color
                          </span>
                          <input
                            type="color"
                            value={fontStyles.commentText!.color}
                            onChange={(e) =>
                              onFontStylesChange({
                                ...fontStyles,
                                commentText: {
                                  ...fontStyles.commentText!,
                                  color: e.target.value,
                                },
                              })
                            }
                            className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0"
                          />
                          <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                            <input
                              type="text"
                              value={fontStyles.commentText!.color.toUpperCase()}
                              maxLength={7}
                              onChange={(e) => {
                                let v = e.target.value.toUpperCase();
                                if (!v.startsWith("#"))
                                  v = "#" + v.replace(/[^0-9A-F]/g, "");
                                else
                                  v =
                                    "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                                v = v.slice(0, 7);
                                if (v.length === 7)
                                  onFontStylesChange({
                                    ...fontStyles,
                                    commentText: {
                                      ...fontStyles.commentText!,
                                      color: v,
                                    },
                                  });
                              }}
                              className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Align
                          </span>
                          <div className="flex gap-1">
                            {(["left", "center", "right"] as const).map(
                              (align) => (
                                <button
                                  key={align}
                                  onClick={() =>
                                    onFontStylesChange({
                                      ...fontStyles,
                                      commentText: {
                                        ...fontStyles.commentText!,
                                        textAlign: align,
                                      },
                                    })
                                  }
                                  className={`w-7 h-7 flex items-center justify-center border transition-all ${fontStyles.commentText!.textAlign === align ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#5d4e37] hover:border-[#8b6834]"}`}
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    {align === "left" && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h10M4 18h14"
                                      />
                                    )}
                                    {align === "center" && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M7 12h10M5 18h14"
                                      />
                                    )}
                                    {align === "right" && (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M10 12h10M6 18h14"
                                      />
                                    )}
                                  </svg>
                                </button>
                              ),
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {fontStyles.personName && (
                  <div className="border border-[#d4c4b0] overflow-hidden">
                    <button
                      onClick={() =>
                        setExpandedFontSection(
                          expandedFontSection === "personName"
                            ? null
                            : "personName",
                        )
                      }
                      className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
                    >
                      <span className="text-xs font-bold text-[#2c2419] tracking-wide">
                        PERSON NAME
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#5d4e37]">
                          {fontStyles.personName.fontSize} ·{" "}
                          {fontStyles.personName.fontFamily.split(" ")[0]}
                        </span>
                        <svg
                          className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${expandedFontSection === "personName" ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>
                    {expandedFontSection === "personName" && (
                      <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Font
                          </span>
                          <div className="flex gap-1 flex-1">
                            {(contentLanguage === "english"
                              ? ENGLISH_FONTS
                              : BANGLA_FONTS
                            ).map((font) => (
                              <button
                                key={font.id}
                                onClick={() =>
                                  onFontStylesChange({
                                    ...fontStyles,
                                    personName: {
                                      ...fontStyles.personName!,
                                      fontFamily: font.id,
                                    },
                                  })
                                }
                                className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${fontStyles.personName!.fontFamily === font.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                              >
                                {font.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Size
                          </span>
                          <input
                            type="range"
                            min="12"
                            max="32"
                            value={parseInt(fontStyles.personName!.fontSize)}
                            onChange={(e) =>
                              onFontStylesChange({
                                ...fontStyles,
                                personName: {
                                  ...fontStyles.personName!,
                                  fontSize: `${e.target.value}px`,
                                },
                              })
                            }
                            className="flex-1 h-1 appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.personName!.fontSize) - 12) / 20) * 100}%, #e8dcc8 ${((parseInt(fontStyles.personName!.fontSize) - 12) / 20) * 100}%, #e8dcc8 100%)`,
                            }}
                          />
                          <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">
                            {fontStyles.personName!.fontSize}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Weight
                          </span>
                          <div className="flex gap-1 flex-1">
                            {(
                              [
                                ["400", "N"],
                                ["500", "M"],
                                ["600", "S"],
                                ["700", "B"],
                                ["800", "XB"],
                              ] as const
                            ).map(([w, l]) => (
                              <button
                                key={w}
                                onClick={() =>
                                  onFontStylesChange({
                                    ...fontStyles,
                                    personName: {
                                      ...fontStyles.personName!,
                                      fontWeight: w,
                                    },
                                  })
                                }
                                className={`flex-1 py-1 text-[10px] font-bold border transition-all ${fontStyles.personName!.fontWeight === w ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                            Color
                          </span>
                          <input
                            type="color"
                            value={fontStyles.personName!.color}
                            onChange={(e) =>
                              onFontStylesChange({
                                ...fontStyles,
                                personName: {
                                  ...fontStyles.personName!,
                                  color: e.target.value,
                                },
                              })
                            }
                            className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0"
                          />
                          <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                            <input
                              type="text"
                              value={fontStyles.personName!.color.toUpperCase()}
                              maxLength={7}
                              onChange={(e) => {
                                let v = e.target.value.toUpperCase();
                                if (!v.startsWith("#"))
                                  v = "#" + v.replace(/[^0-9A-F]/g, "");
                                else
                                  v =
                                    "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                                v = v.slice(0, 7);
                                if (v.length === 7)
                                  onFontStylesChange({
                                    ...fontStyles,
                                    personName: {
                                      ...fontStyles.personName!,
                                      color: v,
                                    },
                                  });
                              }}
                              className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Week & Date */}
            <div className="border border-[#d4c4b0] overflow-hidden">
              <button
                onClick={() =>
                  setExpandedFontSection(
                    expandedFontSection === "weekDate" ? null : "weekDate",
                  )
                }
                className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
              >
                <span className="text-xs font-bold text-[#2c2419] tracking-wide">
                  WEEK & DATE
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#5d4e37]">
                    {fontStyles.week.fontSize} ·{" "}
                    {fontStyles.week.fontWeight === "700"
                      ? "Bold"
                      : fontStyles.week.fontWeight === "600"
                        ? "Semi"
                        : fontStyles.week.fontWeight === "500"
                          ? "Med"
                          : "Norm"}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${expandedFontSection === "weekDate" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {expandedFontSection === "weekDate" && (
                <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                      Language
                    </span>
                    <div className="flex gap-1 flex-1">
                      {(["bangla", "english"] as const).map((lang) => (
                        <button
                          key={lang}
                          onClick={() =>
                            onFontStylesChange({
                              ...fontStyles,
                              weekDateLanguage: lang,
                            })
                          }
                          className={`flex-1 py-1 text-[10px] font-bold border transition-all ${(fontStyles.weekDateLanguage ?? "bangla") === lang ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                        >
                          {lang === "bangla" ? "বাংলা" : "English"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                      Size
                    </span>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={parseInt(fontStyles.week.fontSize)}
                      onChange={(e) =>
                        onFontStylesChange({
                          ...fontStyles,
                          week: {
                            ...fontStyles.week,
                            fontSize: `${e.target.value}px`,
                          },
                          date: {
                            ...fontStyles.date,
                            fontSize: `${e.target.value}px`,
                          },
                        })
                      }
                      className="flex-1 h-1 appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.week.fontSize) - 12) / 20) * 100}%, #e8dcc8 ${((parseInt(fontStyles.week.fontSize) - 12) / 20) * 100}%, #e8dcc8 100%)`,
                      }}
                    />
                    <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">
                      {fontStyles.week.fontSize}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                      Weight
                    </span>
                    <div className="flex gap-1 flex-1">
                      {(
                        [
                          ["400", "Norm"],
                          ["500", "Med"],
                          ["600", "Semi"],
                          ["700", "Bold"],
                        ] as const
                      ).map(([w, l]) => (
                        <button
                          key={w}
                          onClick={() =>
                            onFontStylesChange({
                              ...fontStyles,
                              week: { ...fontStyles.week, fontWeight: w },
                              date: { ...fontStyles.date, fontWeight: w },
                            })
                          }
                          className={`flex-1 py-1 text-[10px] font-bold border transition-all ${fontStyles.week.fontWeight === w ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                      Color
                    </span>
                    <input
                      type="color"
                      value={fontStyles.week.color}
                      onChange={(e) =>
                        onFontStylesChange({
                          ...fontStyles,
                          week: { ...fontStyles.week, color: e.target.value },
                          date: { ...fontStyles.date, color: e.target.value },
                        })
                      }
                      className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0"
                    />
                    <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                      <input
                        type="text"
                        value={fontStyles.week.color.toUpperCase()}
                        maxLength={7}
                        onChange={(e) => {
                          let v = e.target.value.toUpperCase();
                          if (!v.startsWith("#"))
                            v = "#" + v.replace(/[^0-9A-F]/g, "");
                          else v = "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                          v = v.slice(0, 7);
                          if (v.length === 7)
                            onFontStylesChange({
                              ...fontStyles,
                              week: { ...fontStyles.week, color: v },
                              date: { ...fontStyles.date, color: v },
                            });
                        }}
                        className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Headline */}
            {cardType !== "comment" && (
              <div className="border border-[#d4c4b0] overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedFontSection(
                      expandedFontSection === "headline" ? null : "headline",
                    )
                  }
                  className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
                >
                  <span className="text-xs font-bold text-[#2c2419] tracking-wide">
                    HEADLINE
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#5d4e37]">
                      {fontStyles.headline.fontSize} ·{" "}
                      {fontStyles.headline.fontFamily.split(" ")[0]}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${expandedFontSection === "headline" ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {expandedFontSection === "headline" && (
                  <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Font
                      </span>
                      <div className="flex gap-1 flex-1">
                        {(contentLanguage === "english"
                          ? ENGLISH_FONTS
                          : BANGLA_FONTS
                        ).map((font) => (
                          <button
                            key={font.id}
                            onClick={() =>
                              onFontStylesChange({
                                ...fontStyles,
                                headline: {
                                  ...fontStyles.headline,
                                  fontFamily: font.id,
                                },
                              })
                            }
                            className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${fontStyles.headline.fontFamily === font.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                          >
                            {font.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Size
                      </span>
                      <input
                        type="range"
                        min="16"
                        max="48"
                        value={parseInt(fontStyles.headline.fontSize)}
                        onChange={(e) =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              fontSize: `${e.target.value}px`,
                            },
                          })
                        }
                        className="flex-1 h-1 appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(fontStyles.headline.fontSize) - 16) / 32) * 100}%, #e8dcc8 ${((parseInt(fontStyles.headline.fontSize) - 16) / 32) * 100}%, #e8dcc8 100%)`,
                        }}
                      />
                      <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">
                        {fontStyles.headline.fontSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Weight
                      </span>
                      <div className="flex gap-1 flex-1">
                        {(
                          [
                            ["400", "N"],
                            ["500", "M"],
                            ["600", "S"],
                            ["700", "B"],
                            ["800", "XB"],
                          ] as const
                        ).map(([w, l]) => (
                          <button
                            key={w}
                            onClick={() =>
                              onFontStylesChange({
                                ...fontStyles,
                                headline: {
                                  ...fontStyles.headline,
                                  fontWeight: w,
                                },
                              })
                            }
                            className={`flex-1 py-1 text-[10px] font-bold border transition-all ${fontStyles.headline.fontWeight === w ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Color
                      </span>
                      <input
                        type="color"
                        value={fontStyles.headline.color}
                        onChange={(e) =>
                          onFontStylesChange({
                            ...fontStyles,
                            headline: {
                              ...fontStyles.headline,
                              color: e.target.value,
                            },
                          })
                        }
                        className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0"
                      />
                      <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                        <input
                          type="text"
                          value={fontStyles.headline.color.toUpperCase()}
                          maxLength={7}
                          onChange={(e) => {
                            let v = e.target.value.toUpperCase();
                            if (!v.startsWith("#"))
                              v = "#" + v.replace(/[^0-9A-F]/g, "");
                            else v = "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                            v = v.slice(0, 7);
                            if (v.length === 7)
                              onFontStylesChange({
                                ...fontStyles,
                                headline: { ...fontStyles.headline, color: v },
                              });
                          }}
                          className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Align
                      </span>
                      <div className="flex gap-1">
                        {(["left", "center", "right"] as const).map((align) => (
                          <button
                            key={align}
                            onClick={() =>
                              onFontStylesChange({
                                ...fontStyles,
                                headline: {
                                  ...fontStyles.headline,
                                  textAlign: align,
                                },
                              })
                            }
                            className={`w-7 h-7 flex items-center justify-center border transition-all ${fontStyles.headline.textAlign === align ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#5d4e37] hover:border-[#8b6834]"}`}
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              {align === "left" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 12h10M4 18h14"
                                />
                              )}
                              {align === "center" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M7 12h10M5 18h14"
                                />
                              )}
                              {align === "right" && (
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M10 12h10M6 18h14"
                                />
                              )}
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">
                        Shadow
                      </span>
                      <div className="flex gap-1 flex-1">
                        {(
                          ["none", "soft", "hard", "glow", "outline"] as const
                        ).map((preset) => (
                          <button
                            key={preset}
                            onClick={() =>
                              onFontStylesChange({
                                ...fontStyles,
                                headline: {
                                  ...fontStyles.headline,
                                  textShadow: {
                                    preset,
                                    angle:
                                      fontStyles.headline.textShadow?.angle ||
                                      135,
                                  },
                                },
                              })
                            }
                            className={`flex-1 py-1 text-[10px] font-bold border transition-all capitalize ${(fontStyles.headline.textShadow?.preset || "none") === preset ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                          >
                            {preset === "outline"
                              ? "Out"
                              : preset.charAt(0).toUpperCase() +
                                preset.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Font Selection Modal (Placeholder) */}
            {showFontModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#faf8f5] border-2 border-[#d4c4b0] p-6 max-w-md w-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-lora font-bold text-[#2c2419]">
                      Select Font -{" "}
                      {selectedFontType === "weekDate"
                        ? "Week & Date"
                        : "Headline"}
                    </h3>
                    <button
                      onClick={() => setShowFontModal(false)}
                      className="text-[#5d4e37] hover:text-[#2c2419]"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {/* Font options would go here */}
                    <button
                      onClick={() => {
                        // placeholder: apply font selection for Week/Headline in future
                        setShowFontModal(false);
                      }}
                      className="w-full p-3 bg-[#f5f0e8] hover:bg-[#e8dcc8] transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 text-left">
                        <span className="font-noto-bengali text-[#2c2419] block">
                          আমার সোনার বাংলা
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        Noto Serif Bengali
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowFontModal(false);
                      }}
                      className="w-full p-3 bg-[#f5f0e8] hover:bg-[#e8dcc8] transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 text-left">
                        <span className="font-dm-sans text-[#2c2419] block">
                          আমার সোনার বাংলা
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        DM Sans
                      </div>
                    </button>

                    <div className="w-full p-3 bg-[#f5f0e8] transition-colors flex items-center justify-between opacity-50 cursor-not-allowed">
                      <div className="flex-1 text-left">
                        <span className="text-base font-inter text-[#5d4e37] block">
                          Font preview
                        </span>
                      </div>
                      <div className="ml-4 text-sm font-inter text-[#5d4e37]">
                        More fonts coming soon...
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowFontModal(false)}
                    className="w-full mt-4 px-4 py-2 bg-[#2c2419] text-[#faf8f5] font-inter font-medium hover:bg-[#8b6834] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Visibility Tab */}
        {activeTab === "Visibility" &&
          visibilitySettings &&
          onVisibilityChange && (
            <div className="space-y-3">
              <p className="text-sm text-[#5d4e37] font-inter mb-4">
                Toggle elements visibility on your card
              </p>

              {cardType === "comment" ? (
                // Comment Card Specific Visibility Options
                <>
                  {/* Logo Toggle */}
                  {"showLogo" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showLogo ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Logo
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showLogo: !visibilitySettings.showLogo,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showLogo
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showLogo
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Date Toggle */}
                  {"showDate" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showDate ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Date
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showDate: !visibilitySettings.showDate,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showDate
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showDate
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Comment Text Toggle */}
                  {"showCommentText" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showCommentText ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Comment Text
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showCommentText:
                              !visibilitySettings.showCommentText,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showCommentText
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showCommentText
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Person Name Toggle */}
                  {"showPersonName" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showPersonName ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Person Name
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showPersonName: !visibilitySettings.showPersonName,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showPersonName
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showPersonName
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Person Role Toggle */}
                  {"showPersonRole" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showPersonRole ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Person Role
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showPersonRole: !visibilitySettings.showPersonRole,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showPersonRole
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showPersonRole
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Image Toggle */}
                  {"showImage" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showImage ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Image
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showImage: !visibilitySettings.showImage,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showImage
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showImage
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Social Media Toggle */}
                  {"showSocialMedia" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showSocialMedia ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Footer
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showSocialMedia:
                              !visibilitySettings.showSocialMedia,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showSocialMedia
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showSocialMedia
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Ad Banner Toggle */}
                  {"showAdBanner" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showAdBanner ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Ad Banner
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showAdBanner: !visibilitySettings.showAdBanner,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showAdBanner
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showAdBanner
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Poll Title Toggle */}
                  {"showPollTitle" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showPollTitle ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Poll Title
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showPollTitle: !visibilitySettings.showPollTitle,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showPollTitle
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showPollTitle
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Poll Options Toggle */}
                  {"showPollOptions" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showPollOptions ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Poll Options
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showPollOptions:
                              !visibilitySettings.showPollOptions,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showPollOptions
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showPollOptions
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Poll Icons Toggle */}
                  {"showPollIcons" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(visibilitySettings as any).showPollIcons ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Poll Icons
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showPollIcons: !(visibilitySettings as any)
                              .showPollIcons,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          (visibilitySettings as any).showPollIcons
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            (visibilitySettings as any).showPollIcons
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // URL/Custom Card Visibility Options
                <>
                  {/* Week Toggle */}
                  {"showWeek" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showWeek ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Week
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showWeek: !visibilitySettings.showWeek,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showWeek
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showWeek
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Date Toggle */}
                  {"showDate" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showDate ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Date
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showDate: !visibilitySettings.showDate,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showDate
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showDate
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Logo Toggle */}
                  {"showLogo" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showLogo ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Logo
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showLogo: !visibilitySettings.showLogo,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showLogo
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showLogo
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* QR Code Toggle */}
                  {"showQrCode" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showQrCode ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          QR Code
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showQrCode: !visibilitySettings.showQrCode,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showQrCode
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showQrCode
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Title Toggle */}
                  {"showTitle" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showTitle ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Title
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showTitle: !visibilitySettings.showTitle,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showTitle
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showTitle
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Ad Banner Toggle */}
                  {"showAdBanner" in visibilitySettings && (
                    <div className="bg-[#e8dcc8] border-2 border-[#d4c4b0] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {visibilitySettings.showAdBanner ? (
                          <Eye className="w-5 h-5 text-[#8b6834]" />
                        ) : (
                          <EyeOff className="w-5 h-5 text-[#5d4e37]" />
                        )}
                        <span className="text-sm font-medium font-inter text-[#2c2419]">
                          Ad Banner
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          onVisibilityChange({
                            ...visibilitySettings,
                            showAdBanner: !visibilitySettings.showAdBanner,
                          })
                        }
                        className={`relative w-14 h-7 transition-colors border-2 ${
                          visibilitySettings.showAdBanner
                            ? "bg-[#8b6834] border-[#8b6834]"
                            : "bg-[#d4c4b0] border-[#d4c4b0]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 bottom-0.5 w-6 bg-white transition-all ${
                            visibilitySettings.showAdBanner
                              ? "right-0.5"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

        {/* Frame Tab */}
        {activeTab === "Frame" && (
          <div className="space-y-4">
            {/* Border Color */}
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Border Color{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({FRAME_COLORS.length} colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {FRAME_COLORS.map((item) => (
                  <button
                    key={item.color}
                    onClick={() => handleFrameColorChange(item.color)}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${
                      frameBorderColor === item.color
                        ? "border-[#8b6834] shadow-md"
                        : "border-[#d4c4b0] hover:scale-95"
                    }`}
                    style={{ backgroundColor: item.color }}
                    title={item.name}
                  >
                    {frameBorderColor === item.color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">
                        selected
                      </div>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => setShowFrameColorPicker(!showFrameColorPicker)}
                  className="w-14 h-14 flex-shrink-0 border-2 border-dashed border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8] transition-all overflow-hidden flex items-center justify-center"
                  title="Add custom color"
                >
                  <Plus className="w-5 h-5 text-[#8b6834]" />
                </button>
              </div>

              {/* Color Picker Modal for Frame */}
              {showFrameColorPicker && (
                <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Pick a custom frame color
                    </label>
                    <button
                      onClick={() => setShowFrameColorPicker(false)}
                      className="text-[#5d4e37] hover:text-[#2c2419]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={tempFrameColor}
                      onChange={(e) => setTempFrameColor(e.target.value)}
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                    />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input
                        type="text"
                        value={tempFrameColor.toUpperCase()}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          // Always start with #
                          if (!value.startsWith("#")) {
                            value = "#" + value.replace(/[^0-9A-F]/g, "");
                          } else {
                            value =
                              "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                          }
                          value = value.slice(0, 7);
                          setTempFrameColor(value);
                        }}
                        onBlur={(e) => {
                          const value = e.target.value;
                          if (
                            value.length !== 7 ||
                            !/^#[0-9A-F]{6}$/i.test(value)
                          ) {
                            setTempFrameColor("#000000");
                          }
                        }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (tempFrameColor.length === 7) {
                        handleFrameColorChange(tempFrameColor);
                        setShowFrameColorPicker(false);
                        setTempFrameColor("#000000");
                      }
                    }}
                    className="w-full mt-3 bg-[#8b6834] text-[#faf8f5] py-2 px-4 font-inter font-medium hover:bg-[#6b4e1f] transition-colors shadow-sm"
                  >
                    Apply Color
                  </button>
                </div>
              )}
            </div>

            {/* Border Thickness */}
            <div>
              <h3 className="text-sm font-medium text-slate-900 mb-3">
                Border Thickness
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={frameBorderThickness}
                  onChange={(e) =>
                    handleFrameThicknessChange(Number(e.target.value))
                  }
                  className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer\"
                  style={{
                    background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${frameBorderThickness * 10}%, #e8dcc8 ${frameBorderThickness * 10}%, #e8dcc8 100%)`,
                  }}
                />
                <div className="w-8 text-right text-md font-medium font-inter text-[#2c2419]">
                  {frameBorderThickness}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === "Footer" && (
          <div className="space-y-5">
            {/* ── Show / Hide footer toggle (URL cards only) ── */}
            {cardType === "url" &&
              visibilitySettings &&
              "showFooter" in visibilitySettings && (
                <div className="flex items-center justify-between py-2 border-b border-[#e8dcc8]">
                  <span className="text-sm font-semibold text-[#2c2419] font-inter">
                    Show Footer
                  </span>
                  <button
                    onClick={() =>
                      onVisibilityChange?.({
                        ...visibilitySettings,
                        showFooter: !(visibilitySettings as VisibilitySettings)
                          .showFooter,
                      })
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      (visibilitySettings as VisibilitySettings).showFooter
                        ? "bg-[#8b6834]"
                        : "bg-[#d4c4b0]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                        (visibilitySettings as VisibilitySettings).showFooter
                          ? "left-5"
                          : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              )}

            {/* ── Icon color (URL cards only) ── */}
            {cardType === "url" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2c2419] font-inter">
                  Icon Style
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => onFooterIconColorChange?.("white")}
                    className={`flex-1 py-2 text-xs font-semibold border transition-colors ${
                      footerIconColor === "white"
                        ? "bg-[#8b6834] text-white border-[#8b6834]"
                        : "bg-white text-[#5d4e37] border-[#d4c4b0] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    White
                  </button>
                  <button
                    onClick={() => onFooterIconColorChange?.("colored")}
                    className={`flex-1 py-2 text-xs font-semibold border transition-colors ${
                      footerIconColor === "colored"
                        ? "bg-[#8b6834] text-white border-[#8b6834]"
                        : "bg-white text-[#5d4e37] border-[#d4c4b0] hover:bg-[#f5f0e8]"
                    }`}
                  >
                    Colored
                  </button>
                </div>
              </div>
            )}

            {/* ── Footer items (URL cards only) ── */}
            {cardType === "url" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#2c2419] font-inter">
                    Footer Items
                  </p>
                  <span className="text-xs text-[#8b7055]">
                    {footerItems.length}/3
                  </span>
                </div>

                {/* Existing items */}
                {footerItems.length > 0 && (
                  <FooterItemsList
                    footerItems={footerItems}
                    onFooterItemsChange={onFooterItemsChange}
                  />
                )}

                {/* Add new item */}
                {footerItems.length < 3 && (
                  <FooterItemForm
                    onAdd={(item) =>
                      onFooterItemsChange?.([...footerItems, item])
                    }
                  />
                )}

                {footerItems.length === 0 && (
                  <p className="text-xs text-[#8b7055] font-inter text-center py-2">
                    No items yet. Add up to 3 social, website, or text entries.
                  </p>
                )}
              </div>
            )}

            {/* ── Font customisation ── */}
            {fontStyles?.footer && (
              <div className="space-y-4 border-t border-[#e8dcc8] pt-4">
                <p className="text-sm font-semibold text-[#2c2419] font-inter">
                  Text Style
                </p>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      Font Size
                    </label>
                    <span className="text-sm font-bold text-[#8b6834] bg-[#e8dcc8] px-3 py-1 border border-[#d4c4b0]">
                      {fontStyles.footer.fontSize}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={parseInt(fontStyles.footer.fontSize)}
                    onChange={(e) =>
                      onFontStylesChange?.({
                        ...fontStyles,
                        footer: {
                          ...fontStyles.footer,
                          fontSize: `${e.target.value}px`,
                        },
                      })
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${
                        ((parseInt(fontStyles.footer.fontSize) - 10) / 14) * 100
                      }%, #e8dcc8 ${
                        ((parseInt(fontStyles.footer.fontSize) - 10) / 14) * 100
                      }%, #e8dcc8 100%)`,
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#2c2419] mb-2 block font-inter">
                    Text Color
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="color"
                      value={fontStyles.footer.color}
                      onChange={(e) =>
                        onFontStylesChange?.({
                          ...fontStyles,
                          footer: {
                            ...fontStyles.footer,
                            color: e.target.value,
                          },
                        })
                      }
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm"
                    />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input
                        type="text"
                        value={fontStyles.footer.color.toUpperCase()}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          if (!value.startsWith("#"))
                            value = "#" + value.replace(/[^0-9A-F]/g, "");
                          else
                            value =
                              "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                          value = value.slice(0, 7);
                          if (value.length === 7)
                            onFontStylesChange?.({
                              ...fontStyles,
                              footer: { ...fontStyles.footer, color: value },
                            });
                        }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ad Banner Tab */}
        {activeTab === "Ad Banner" && (
          <div className="space-y-4">
            {/* Upload Section */}
            {!adBannerImage ? (
              <div>
                <label className="block border-2 border-dashed border-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onAdBannerChange?.(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Upload className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm text-slate-600">upload ad banner</p>
                </label>
              </div>
            ) : null}

            {/* Preview Section */}
            {adBannerImage && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-medium text-slate-700">
                      Preview
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAdBannerPositionChange?.({ x: 0, y: 0 });
                        onAdBannerZoomChange?.(100);
                      }}
                      className="p-1 bg-[#8b6834] hover:bg-[#6d5228] text-white text-xs transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Interactive Preview Container */}
                  <div
                    className="bg-gray-200 border border-gray-400 overflow-hidden cursor-move relative"
                    style={{
                      width: "100%",
                      aspectRatio: "500 / 80",
                      height: "auto",
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      const startX = e.clientX;
                      const startY = e.clientY;
                      const startPosX = adBannerPosition?.x || 0;
                      const startPosY = adBannerPosition?.y || 0;

                      const handleMouseMove = (moveEvent: MouseEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        const deltaY = moveEvent.clientY - startY;
                        if (onAdBannerPositionChange) {
                          onAdBannerPositionChange({
                            x: Math.max(
                              -200,
                              Math.min(200, startPosX + deltaX),
                            ),
                            y: Math.max(
                              -200,
                              Math.min(200, startPosY + deltaY),
                            ),
                          });
                        }
                      };

                      const handleMouseUp = () => {
                        document.removeEventListener(
                          "mousemove",
                          handleMouseMove,
                        );
                        document.removeEventListener("mouseup", handleMouseUp);
                      };

                      document.addEventListener("mousemove", handleMouseMove);
                      document.addEventListener("mouseup", handleMouseUp);
                    }}
                  >
                    <img
                      src={adBannerImage}
                      alt="Ad Banner"
                      className="absolute top-1/2 left-1/2 pointer-events-none select-none"
                      style={{
                        transform: `translate(-50%, -50%) translate(${adBannerPosition?.x || 0}px, ${adBannerPosition?.y || 0}px) scale(${(adBannerZoom || 100) / 100})`,
                        transformOrigin: "center center",
                        maxWidth: "none",
                        maxHeight: "none",
                        width: "auto",
                        height: "auto",
                        minWidth: "100%",
                        minHeight: "100%",
                      }}
                      draggable={false}
                    />
                  </div>
                </div>

                {/* Zoom Control */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-slate-700">
                      Zoom
                    </label>
                    <span className="text-xs font-bold text-[#8b6834] bg-[#e8dcc8] px-3 py-1 border border-[#d4c4b0]">
                      {adBannerZoom}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    step="5"
                    value={adBannerZoom}
                    onChange={(e) =>
                      onAdBannerZoomChange?.(parseInt(e.target.value))
                    }
                    className="w-full h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((adBannerZoom - 50) / 150) * 100}%, #e8dcc8 ${((adBannerZoom - 50) / 150) * 100}%, #e8dcc8 100%)`,
                    }}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdBannerChange?.(null);
                      onAdBannerPositionChange?.({ x: 0, y: 0 });
                      onAdBannerZoomChange?.(100);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 hover:bg-gray-400 transition-colors text-slate-700 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Change</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature={upgradeFeature}
        requiredPlan="Basic"
      />
    </div>
  );
}
