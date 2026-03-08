"use client";

import {
  PhotocardData,
  BackgroundOptions,
  CardFontStyles,
  VisibilitySettings,
  FooterItem,
  WatermarkSettings,
} from "@/types";
import { darkenHexColor } from "@/lib/utils";
import { getProxiedImageUrl } from "@/utils/imageProxy";
import { Image } from "lucide-react";

// The organic wavy-edge banner shape (1920×1064 viewBox)
const BANNER_PATH =
  "M46.3124 963.112C46.3124 953.251 95.3433 975.274 95.3433 962.509C95.3433 968.996 143.714 953.853 143.714 948.309C143.714 941.373 180.418 943.926 180.418 926.669C180.418 946.655 224.159 953.809 224.159 935.654C224.159 913.817 257.413 907.09 257.413 918.156C257.413 901.491 292.737 945.493 292.737 929.814C292.737 931.896 331.04 909.533 331.04 910.157C331.04 911.713 363.804 931.271 363.804 935.665C363.804 927.721 400.847 931.195 400.847 935.314C400.847 953.415 439.05 937.834 439.05 947.838C439.05 943.39 479.992 946.742 479.992 946.753C479.992 951.508 518.895 946.271 518.895 955.793C518.895 935.292 558.358 983.984 558.358 962.049C558.358 967.834 592.721 1000.18 592.721 993.561C592.721 982.933 634.304 997.593 634.304 989.32C634.304 981.705 674.166 984.993 674.166 993.583C674.166 983.656 709.4 1027.89 709.4 1020.81C709.4 1023.94 749.282 1016.7 749.282 1019.41C749.282 1031.24 787.375 1038.69 787.375 1026.4C787.375 1020.7 826.008 1006.99 826.008 1025.71C826.008 1024.03 864.291 1023.7 864.291 1033.5C864.291 1042.56 906.003 1023.51 906.003 1031.19C906.003 1025.65 944.686 1017.08 944.686 1013.3C944.686 1010.35 981.699 989.879 981.699 992.991C981.699 992.158 1028.49 986.548 1028.49 998.634C1028.49 1007.48 1064.19 973.751 1064.19 974.375C1064.19 975.296 1095.3 944.869 1095.3 938.568C1095.3 940.727 1134.23 918.101 1134.23 921.618C1134.23 918.682 1177.42 926.889 1177.42 919.186C1177.42 914.431 1219.23 917.871 1219.23 918.759C1219.23 919.131 1259.23 893.569 1259.23 888.846C1259.23 886.173 1299.93 873.671 1299.93 878.065C1299.93 877.528 1344.13 888.112 1344.13 882.207C1344.13 877.101 1371.44 845.129 1371.44 842.455C1371.44 834.588 1411.64 829.921 1411.64 829.406C1411.64 837.799 1454.03 821.846 1454.03 824.87C1454.03 831.203 1495.14 833.778 1495.14 836.1C1495.14 839.344 1537.49 819.797 1537.49 819.731C1537.49 812.85 1574.07 844.581 1574.07 844.428C1574.07 845.249 1619.49 859.931 1619.49 847.145C1619.49 843.935 1652.03 876.717 1652.03 880.202C1652.03 893.667 1689.34 917.718 1689.34 902.389C1689.34 921.991 1722.4 889.778 1722.4 891.805C1722.4 891.903 1758.1 900.691 1758.1 893.58C1758.1 896.768 1794.24 891.684 1794.24 897.283C1794.24 911.187 1835.18 876.049 1835.18 868.598C1835.18 863.668 1877.48 906.684 1877.48 882.349C1877.48 860.49 1917.76 888.156 1917.76 897.974C1917.76 892.451 1960.69 906.465 1960.69 902.137C1960.69 893.919 1997.91 915.34 1997.91 921.312C1997.91 914.365 2038 936.454 2038 929.43C2038 917.948 2073.41 975.822 2073.41 960.625C2073.41 962.673 2113.29 963.912 2113.29 971.406C2113.29 948.331 2154.88 965.939 2154.88 972.217C2154.88 972.677 2198.09 958.291 2198.09 962.432C2198.09 973.159 2237.12 989.496 2237.12 977.356C2237.12 979.437 2266.38 979.185 2266.38 971.296C2266.38 968.886 2291.54 939.522 2291.54 951.235C2291.54 953.568 2305.97 916.249 2305.97 912.984C2305.97 912.086 2321.76 863.591 2321.76 869.563C2321.76 871.338 2312.33 821.495 2312.33 826.174C2312.33 834.446 2324.23 783.727 2324.23 784.976C2324.23 786.236 2323.64 746.068 2323.64 741.97C2323.64 739.582 2351.19 709.012 2351.19 704.421C2351.19 705.298 2345.48 660.364 2345.48 660.364L2354.14 619.188L2351.53 576.052L2378.37 537.418L2368.29 493.645L2358.76 451.418L2383 408.489L2375.08 365.889L2361.21 325.25L2352.79 283.209L2320.68 249.287L2314.36 201.263L2279.21 170.978L2274.05 122.122L2240.31 88.616L2225.73 51.308L2216.81 9.91323L2175.13 5.43189L2135.78 -16.7337L2095.66 0.534203L2056.54 -21.6424L2016.87 -22.1026L1977.18 -22.1793L1937.27 -12.5701L1897.98 -28.2822L1858.26 -26.7592L1818.72 -33.0155L1778.98 -30.2325L1738.8 -8.9544L1699.28 -15.649L1659.9 -29.0273L1620.25 -30.0463L1580.38 -21.3356L1540.79 -25.302L1501.03 -21.478L1461.53 -30.1339L1422.11 -42.6466L1382.1 -25.8388L1342.77 -44.0271L1302.79 -27.6029L1263.04 -23.2092L1223.74 -44.9037L1183.67 -21.2589L1144.23 -34.9659L1104.76 -47.5662L1064.91 -36.7847L1025.17 -31.1858L985.489 -30.123L945.866 -32.8622L906.443 -54.4252L866.751 -53.7568L826.948 -40.0389L787.175 -27.6358L747.593 -37.5078L708.02 -51.4997L668.357 -53.5815L628.585 -30.8571L588.972 -43.7423L549.299 -43.8737L509.637 -43.6656L469.974 -34.8782L430.281 -57L390.669 -32.3581L351.006 -34.166L311.253 -51.3901L271.591 -49.4069L232.018 -37.201L192.305 -41.8248L152.613 -44.6517L113.11 -30.5612L73.2774 -42.9205L35.9343 -38.22L-1.60872 -38.998L-39.1618 -36.8723L-73.5154 -13.9507L-111.778 -15.8462L-148.392 -6.28093L-182.865 10.7679L-208.141 42.2796L-241.534 63.3825L-269.079 93.7986L-279.307 135.018L-288.166 175.109L-282.227 217.6L-291.445 256.737L-290.525 297.332L-291.445 337.894L-297.704 380.33L-305.712 422.722L-309.852 465.3L-312.451 507.977L-313.911 550.719L-319 593.528L-296.104 635.821L-300.473 678.498L-300.024 721.076L-291.585 762.964L-309.852 808.018L-304.453 850.695C-304.453 850.695 -290.145 901.567 -290.145 900.066C-290.145 902.148 -264.81 945.559 -264.81 941.242C-264.81 940.847 -230.026 971.22 -230.026 962.115C-230.026 961.107 -194.243 947.115 -194.243 942.557C-194.243 934.328 -154.4 930.373 -154.4 930.428C-154.4 944.211 -113.878 951.037 -113.878 943.006C-113.878 944.77 -73.9753 949.317 -73.9753 947.969C-73.9753 963.221 -33.3528 924.796 -33.3528 942.173C-33.3528 931.14 5.8599 961.797 5.8599 959.814C5.8599 954.083 46.3124 955.146 46.3124 963.112Z";

// ─── Text helpers (same implementation as other URL cards) ───────────────────

function isLightColor(color: string): boolean {
  let r = 0, g = 0, b = 0;
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    r = parseInt(hex.substr(0, 2), 16);
    g = parseInt(hex.substr(2, 2), 16);
    b = parseInt(hex.substr(4, 2), 16);
  } else if (color.startsWith("rgb")) {
    const match = color.match(/\d+/g);
    if (match) { r = +match[0]; g = +match[1]; b = +match[2]; }
  }
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.5;
}

function getTextShadow(preset: string, angle = 135, textColor = "#ffffff"): string {
  if (preset === "none" || !preset) return "none";
  const rad = (angle * Math.PI) / 180;
  const dx = Math.cos(rad) * 2;
  const dy = Math.sin(rad) * 2;
  const light = isLightColor(textColor);
  switch (preset) {
    case "soft":  return light ? `${dx}px ${dy}px 4px rgba(0,0,0,0.4)` : `${dx}px ${dy}px 4px rgba(255,255,255,0.4)`;
    case "hard":  return light ? `${dx*1.5}px ${dy*1.5}px 0px rgba(0,0,0,0.8)` : `${dx*1.5}px ${dy*1.5}px 0px rgba(255,255,255,0.8)`;
    case "glow":  return light ? `0 0 8px rgba(0,0,0,0.6),0 0 16px rgba(0,0,0,0.4)` : `0 0 8px rgba(255,255,255,0.8),0 0 16px rgba(255,255,255,0.5)`;
    case "outline": return light
      ? `${dx}px ${dy}px 0 rgba(0,0,0,0.9),${-dx}px ${-dy}px 0 rgba(0,0,0,0.9),${dy}px ${-dx}px 0 rgba(0,0,0,0.9),${-dy}px ${dx}px 0 rgba(0,0,0,0.9)`
      : `${dx}px ${dy}px 0 rgba(255,255,255,0.9),${-dx}px ${-dy}px 0 rgba(255,255,255,0.9),${dy}px ${-dx}px 0 rgba(255,255,255,0.9),${-dy}px ${dx}px 0 rgba(255,255,255,0.9)`;
    default: return "none";
  }
}

function getTextStroke(width: number, color: string): string {
  if (!width) return "none";
  const steps = 8;
  return Array.from({ length: steps }, (_, i) => {
    const angle = (i * 2 * Math.PI) / steps;
    return `${(Math.cos(angle) * width).toFixed(2)}px ${(Math.sin(angle) * width).toFixed(2)}px 0px ${color}`;
  }).join(", ");
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface BannerUrlCardProps {
  data: PhotocardData;
  isGenerating?: boolean;
  background?: BackgroundOptions;
  id?: string;
  fullSize?: boolean;
  frameBorderColor?: string;
  frameBorderThickness?: number;
  adBannerImage?: string | null;
  adBannerZoom?: number;
  adBannerPosition?: { x: number; y: number };
  fontStyles?: CardFontStyles;
  visibilitySettings?: VisibilitySettings;
  footerItems?: FooterItem[];
  footerOpacity?: number;
  footerIconColor?: "white" | "colored";
  watermark?: WatermarkSettings;
  isLogoFavicon?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BannerUrlCard({
  data,
  isGenerating = false,
  background = { type: "solid", color: "#dc2626" },
  id = "photocard",
  fullSize = false,
  frameBorderColor = "#FFFFFF",
  frameBorderThickness = 0,
  adBannerImage = null,
  adBannerZoom = 100,
  adBannerPosition = { x: 0, y: 0 },
  footerItems = [],
  footerOpacity = 100,
  footerIconColor = "colored",
  watermark,
  fontStyles,
  visibilitySettings = {
    showWeek: true,
    showDate: true,
    showLogo: true,
    showQrCode: false,
    showTitle: true,
    showAdBanner: true,
    showFooter: false,
  },
  isLogoFavicon = false,
}: BannerUrlCardProps) {

  // ── Colour helpers ──────────────────────────────────────────────────────────

  const getBannerColor = (): string => {
    if (!background) return "#dc2626";
    if (background.type === "gradient" && background.gradientFrom) return background.gradientFrom;
    return background.color || "#dc2626";
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return { backgroundColor: "#1a1410" };
    if (background.type === "gradient" && background.gradientFrom && background.gradientTo)
      return { backgroundImage: `linear-gradient(135deg, ${background.gradientFrom}, ${background.gradientTo})` };
    return { backgroundColor: background.color };
  };

  const getPatternStyle = (): React.CSSProperties => {
    if (!background?.pattern || background.pattern === "none") return {};
    const opacity = background.patternOpacity ?? 0.3;
    switch (background.pattern) {
      case "p1": return { backgroundImage: "url(/patterns/p1.png)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
      case "p2": return { backgroundImage: "url(/patterns/p2.png)", backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
      case "custom":
        if (background.patternImage) return { backgroundImage: `url(${background.patternImage})`, backgroundSize: "cover", backgroundRepeat: "no-repeat", backgroundPosition: "center", opacity };
        return {};
      default: return {};
    }
  };

  // ── Date / domain helpers ───────────────────────────────────────────────────

  const getWeekday = (): string => {
    if (fontStyles?.weekDateLanguage === "english")
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return days[new Date().getDay()];
  };

  const getCardDate = (): string => {
    const lang = fontStyles?.weekDateLanguage === "english" ? "en-US" : "bn-BD";
    return new Date().toLocaleDateString(lang, { year: "numeric", month: "long", day: "numeric" });
  };

  const getSiteDomain = (): string => {
    try { return new URL(data.url).hostname.toLowerCase().replace("www.", ""); }
    catch { return data.siteName?.toLowerCase() || "example.com"; }
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const bannerColor = getBannerColor();
  const footerBg = darkenHexColor(
    (background?.type === "gradient" ? background?.gradientFrom : undefined) || background?.color || "#1a1410",
  );

  const headlineTextShadow = (() => {
    const c = fontStyles?.headline.color ?? "#FFFFFF";
    const sh = getTextShadow(fontStyles?.headline.textShadow?.preset ?? "none", fontStyles?.headline.textShadow?.angle ?? 135, c);
    const st = getTextStroke(fontStyles?.headline.textStroke?.width ?? 0, fontStyles?.headline.textStroke?.color ?? "#000000");
    if (sh !== "none" && st !== "none") return `${st}, ${sh}`;
    if (st !== "none") return st;
    return sh;
  })();

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      id={id}
      className={fullSize ? "w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl" : "w-full min-w-[448px] max-w-[448px] mx-auto overflow-hidden shadow-xl"}
      style={getBackgroundStyle()}
    >
      {/* ── Inner wrapper (watermark clipping boundary) ── */}
      <div className="relative overflow-hidden">

        {/* Pattern overlay */}
        <div className="absolute inset-0 pointer-events-none z-0" style={getPatternStyle()} />

        {/* Brand watermark */}
        {watermark?.text && watermark?.enabled !== false && (
          <div
            style={{
              position: "absolute",
              bottom: watermark.y ?? 0,
              left: `calc(50% + ${watermark.x ?? 0}px)`,
              transform: `translateX(-50%) rotate(${watermark.rotation ?? 0}deg)`,
              opacity: watermark.opacity ?? 0.30,
              zIndex: 6,
              pointerEvents: "none",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
          >
            <span style={{
              fontFamily: /[\u0980-\u09FF]/.test(watermark.text) ? "Noto Serif Bengali" : "DM Sans",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              fontSize: `${watermark.fontSize ?? 48}px`,
              textTransform: "uppercase",
              color: "#ffffff",
            }}>
              {watermark.text}
            </span>
          </div>
        )}

        {/* ── SVG Banner zone (sits on top of image via z-index) ── */}
        <div className="relative" style={{ zIndex: 10 }}>

          {/* SVG shape — drop-shadow casts onto image below */}
          <div style={{ filter: "drop-shadow(0px 10px 28px rgba(0,0,0,0.55))", display: "block" }}>
            <svg
              width="100%"
              viewBox="0 150 1920 914"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ display: "block" }}
            >
              <defs>
                <linearGradient id={`banner-grad-${id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d0d0d" />
                  <stop offset="100%" stopColor={bannerColor} />
                </linearGradient>
                {/* Dark grid pattern */}
                <pattern id={`banner-grid-${id}`} x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke={background?.patternColor ?? "#000000"} strokeWidth="1.5" />
                </pattern>
                <clipPath id={`banner-clip-${id}`}>
                  <rect width="1920" height="1064" />
                </clipPath>
              </defs>
              <g clipPath={`url(#banner-clip-${id})`}>
                <path d={BANNER_PATH} fill={`url(#banner-grad-${id})`} />
                {/* Grid overlay inside the SVG shape */}
                <path
                  d={BANNER_PATH}
                  fill={`url(#banner-grid-${id})`}
                  opacity={background?.patternOpacity ?? 0.50}
                />
              </g>
            </svg>
          </div>

          {/* Content overlay: logo (top-left) + headline below it */}
          <div
            className="absolute inset-0 flex flex-col justify-start"
            style={{ padding: "22px 18px 16px 18px", gap: "20px" }}
          >
            {/* Logo — top-left */}
            {visibilitySettings.showLogo && (
              <div className="flex items-start">
                {data.logo ? (
                  <div className={`bg-white inline-flex items-center justify-center px-2 py-1.5 ${isLogoFavicon ? "rounded-full" : "rounded-md"} shadow-sm`}>
                    <img
                      src={getProxiedImageUrl(data.logo)}
                      alt="Logo"
                      style={{ maxHeight: "28px", maxWidth: "88px", objectFit: "contain", display: "block" }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-white rounded-sm px-3 py-1 shadow-sm flex items-center gap-1 justify-center">
                      <Image size={16} color="#6b7280" />
                      <span style={{ color: "#6b7280", fontSize: "13px", fontWeight: 700, fontFamily: "Inter, DM Sans, sans-serif", letterSpacing: "0.02em" }}>LOGO</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Headline — bottom of safe zone, left-aligned */}
            {visibilitySettings.showTitle && (
              <h2
                style={{
                  fontFamily: fontStyles?.headline.fontFamily ?? "Noto Serif Bengali",
                  fontSize: fontStyles?.headline.fontSize ?? "22px",
                  fontWeight: fontStyles?.headline.fontWeight ?? "700",
                  color: fontStyles?.headline.color ?? "#FFFFFF",
                  textAlign: (fontStyles?.headline.textAlign as any) ?? "left",
                  letterSpacing: fontStyles?.headline.letterSpacing ?? "0px",
                  lineHeight: 1.35,
                  textShadow: headlineTextShadow !== "none" ? headlineTextShadow : undefined,
                  margin: 0,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: "vertical",
                } as React.CSSProperties}
              >
                {data.title}
              </h2>
            )}
          </div>
        </div>

        {/* ── Article image — slides under the SVG banner ── */}
        <div style={{ marginTop: "-78px", position: "relative", zIndex: 1 }}>
          {data.image ? (
            <img
              src={getProxiedImageUrl(data.image)}
              alt="Article"
              style={{
                width: "100%",
                height: "290px",
                objectFit: "cover",
                display: "block",
                border: frameBorderThickness > 0 ? `${frameBorderThickness}px solid ${frameBorderColor}` : "none",
              }}
              onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.jpg"; }}
            />
          ) : (
            <div style={{ width: "100%", height: "290px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg style={{ width: "48px", height: "48px", color: "#9ca3af" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span style={{ color: "#9ca3af", fontSize: "14px", fontFamily: "Inter, sans-serif" }}>No Image</span>
            </div>
          )}

          {/* Site name + week/date overlaid on image bottom */}
          <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.70) 0%, transparent 100%)",
            padding: "32px 14px 10px 14px",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "8px",
            zIndex: 2,
            pointerEvents: "none",
          }}>
            {(data.siteName || data.url) && (
              <p style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: "10px",
                fontWeight: 400,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "0.02em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "30%",
              }}>
                {getSiteDomain()}
              </p>
            )}
            {/* CTA pill */}
            <span style={{
              fontFamily: "Noto Serif Bengali, DM Sans, sans-serif",
              fontSize: "12px",
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: bannerColor,
              borderRadius: "2px",
              padding: "3px 8px",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
              flexShrink: 0,
            }}>
              বিস্তারিত কমেন্টে
            </span>
            {(visibilitySettings.showWeek || visibilitySettings.showDate) && (
              <p style={{
                fontFamily: fontStyles?.week.fontFamily ?? "Noto Serif Bengali",
                fontSize: "12px",
                fontWeight: 500,
                color: "rgba(255,255,255,0.85)",
                margin: 0,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                textAlign: "right",
              }}>
                {visibilitySettings.showWeek && getWeekday()}
                {visibilitySettings.showWeek && visibilitySettings.showDate && " · "}
                {visibilitySettings.showDate && getCardDate()}
              </p>
            )}
          </div>
        </div>

      </div>{/* ── end inner wrapper ── */}

      {/* ── Social footer bar ── */}
      {visibilitySettings?.showFooter !== false && footerItems.length > 0 && (
        <div
          className="w-full px-4 py-2 flex items-center justify-evenly"
          style={{ background: footerBg, opacity: footerOpacity / 100 }}
        >
          {footerItems.map((item) => (
            <div key={item.id} className="flex items-center gap-1.5">
              {item.type !== "text" && (
                <span className="shrink-0">
                  {item.type === "facebook" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1877f2" : "#fff" }}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                  {item.type === "instagram" && (footerIconColor === "colored"
                    ? <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><defs><radialGradient id={`ig-b-${id}`} cx="30%" cy="107%" r="1.5"><stop offset="0%" stopColor="#ffd676" /><stop offset="10%" stopColor="#f9a12e" /><stop offset="50%" stopColor="#e1306c" /><stop offset="90%" stopColor="#833ab4" /></radialGradient></defs><rect width="24" height="24" rx="6" fill={`url(#ig-b-${id})`} /><rect x="6.5" y="6.5" width="11" height="11" rx="3" stroke="#fff" strokeWidth="1.5" /><circle cx="12" cy="12" r="2.8" stroke="#fff" strokeWidth="1.5" /><circle cx="16.3" cy="7.7" r="0.8" fill="#fff" /></svg>
                    : <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: "#fff" }}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  )}
                  {item.type === "youtube" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#ff0000" : "#fff" }}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>}
                  {item.type === "twitter" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#1d9bf0" : "#fff" }}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>}
                  {item.type === "tiktok" && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" style={{ color: footerIconColor === "colored" ? "#EE1D52" : "#fff" }}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.58a8.27 8.27 0 0 0 4.84 1.55V6.67a4.85 4.85 0 0 1-1.07.02z" /></svg>}
                  {item.type === "website" && <svg className="w-3.5 h-3.5" fill="none" stroke={footerIconColor === "colored" ? "#8b6834" : "white"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>}
                </span>
              )}
              <span style={{ color: fontStyles?.footer?.color ?? "#ffffff", fontSize: fontStyles?.footer?.fontSize ?? "12px", fontFamily: fontStyles?.footer?.fontFamily ?? "DM Sans", fontWeight: fontStyles?.footer?.fontWeight ?? "600" }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Ad banner ── */}
      {visibilitySettings?.showAdBanner && adBannerImage && (
        <div className="w-full relative z-10 overflow-hidden" style={{ height: "60px" }}>
          <img
            src={adBannerImage}
            alt="Advertisement"
            className="absolute top-1/2 left-1/2 pointer-events-none"
            style={{
              transform: `translate(-50%, -50%) translate(${adBannerPosition.x}px, ${adBannerPosition.y}px) scale(${adBannerZoom / 100})`,
              transformOrigin: "center center",
              maxWidth: "none",
              maxHeight: "none",
              width: "auto",
              height: "auto",
              minWidth: "100%",
              minHeight: "100%",
            }}
          />
        </div>
      )}
      {visibilitySettings?.showAdBanner && !adBannerImage && !isGenerating && (
        <div className="w-full bg-[#e8dcc8] border-2 border-dashed border-[#d4c4b0] flex items-center justify-center relative z-10" style={{ height: "80px" }}>
          <span className="text-[#5d4e37] text-xs font-inter">Ad Banner Area (80px height)</span>
        </div>
      )}
    </div>
  );
}
