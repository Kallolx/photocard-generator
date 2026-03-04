"use client";

import { useState, useRef } from "react";
import { BackgroundOptions } from "@/types";
import { ThumbnailFontStyles, ThumbnailImageSlot, SplitStyle } from "@/components/cards/thumbnail-cards/ClassicThumbnailCard";
import { Plus, X, Upload, Image as ImageIcon, GripVertical } from "lucide-react";

type Tab = "Theme" | "Images" | "Text" | "Background" | "Pattern";

const PATTERNS = [
  { id: "none", name: "None" },
  { id: "p-duo", name: "Duo" },
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

const THUMBNAIL_THEMES = [
  { id: "classic", name: "Classic" },
  { id: "framed", name: "Framed" },
];

const SOLID_BG_COLORS = [
  { color: "#690007", name: "Deep Red" },
  { color: "#1a1a2e", name: "Navy Dark" },
  { color: "#16213e", name: "Midnight" },
  { color: "#0b0c10", name: "Carbon" },
];

export interface ThumbnailPanelState {
  theme: string;
  images: ThumbnailImageSlot[];
  logo: string | null;
  logoBackground: string;
  showLogoBackground: boolean;
  title: string;
  textBackground: string;
  fontStyles: ThumbnailFontStyles;
  pattern: BackgroundOptions;
  splitStyle: SplitStyle;
}

interface ThumbnailCustomizationPanelProps {
  state: ThumbnailPanelState;
  onChange: (state: ThumbnailPanelState) => void;
}

function ImageUploadBox({
  label,
  value,
  onUpload,
  onClear,
  aspectRatio = "16/9",
}: {
  label: string;
  value: string | null;
  onUpload: (dataUrl: string) => void;
  onClear: () => void;
  aspectRatio?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#2c2419] tracking-wide font-inter mb-2">
        {label}
      </label>
      {value ? (
        <div className="relative group border-2 border-[#d4c4b0] overflow-hidden bg-[#e8dcc8]" style={{ aspectRatio }}>
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button onClick={onClear} className="bg-red-600 text-white p-1.5 hover:bg-red-700 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label
          className="block border-2 border-dashed border-[#8b6834]/50 bg-[#faf8f5] hover:bg-white transition-colors cursor-pointer text-center"
          style={{ aspectRatio }}
        >
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = (ev) => onUpload(ev.target?.result as string);
              reader.readAsDataURL(f);
              e.target.value = "";
            }}
          />
          <div className="flex flex-col items-center justify-center h-full gap-2 py-4">
            <Upload className="w-5 h-5 mx-auto text-[#8b6834]" />
            <p className="text-xs text-[#5d4e37] font-medium font-inter">Click to upload</p>
          </div>
        </label>
      )}
    </div>
  );
}

export default function ThumbnailCustomizationPanel({
  state,
  onChange,
}: ThumbnailCustomizationPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Images");
  const [expandedFontSection, setExpandedFontSection] = useState<string | null>("headline");
  const [customBgColors, setCustomBgColors] = useState<string[]>([]);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [tempBgColor, setTempBgColor] = useState("#000000");
  const [editingBgColorIndex, setEditingBgColorIndex] = useState<number | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const customPatternRef = useRef<HTMLInputElement>(null);

  // Drag-to-scroll
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleTabMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsScrollRef.current.offsetLeft);
    setScrollLeft(tabsScrollRef.current.scrollLeft);
    tabsScrollRef.current.style.cursor = "grabbing";
  };
  const handleTabMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    tabsScrollRef.current.scrollLeft = scrollLeft - (x - startX) * 2;
  };
  const handleTabMouseUpOrLeave = () => {
    setIsDragging(false);
    if (tabsScrollRef.current) tabsScrollRef.current.style.cursor = "grab";
  };

  const update = (partial: Partial<ThumbnailPanelState>) =>
    onChange({ ...state, ...partial });

  const updateFont = (partial: Partial<ThumbnailFontStyles["headline"]>) =>
    onChange({
      ...state,
      fontStyles: { ...state.fontStyles, headline: { ...state.fontStyles.headline, ...partial } },
    });

  const updatePattern = (partial: Partial<BackgroundOptions>) =>
    update({ pattern: { ...state.pattern, ...partial } });

  const hl = state.fontStyles.headline;
  const TABS: Tab[] = ["Theme", "Images", "Text", "Background", "Pattern"];

  return (
    <div className="bg-[#f5f0e8] p-6 border-2 border-[#d4c4b0] flex flex-col h-full md:min-h-0">
      {/* Tab Navigation */}
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
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={(e) => { if (isDragging) { e.preventDefault(); return; } setActiveTab(tab); }}
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

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto space-y-3 md:min-h-0 no-scrollbar">

        {/* â”€â”€ THEME â”€â”€ */}
        {activeTab === "Theme" && (
          <div>
            <div className="grid grid-cols-2 gap-4">
              {THUMBNAIL_THEMES.map((theme) => (
                <div key={theme.id} className="flex flex-col">
                  <button
                    onClick={() => update({ theme: theme.id })}
                    className={`w-full transition-all duration-200 border-2 overflow-hidden ${
                      state.theme === theme.id
                        ? "border-[#8b6834] shadow-lg shadow-[#8b6834]/30"
                        : "border-[#d4c4b0] hover:border-[#8b6834] hover:shadow-md"
                    }`}
                  >
                    <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
                      <img
                        src={`/themes/${theme.id}-p.png`}
                        alt={theme.name}
                        className="w-full h-full object-cover block"
                      />
                      {state.theme === theme.id && (
                        <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] py-0.5 text-center">
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

        {/* ── IMAGES ── */}
        {activeTab === "Images" && (
          <div className="space-y-5">

            {/* ── Layout: compact pill row ── */}
            <div>
              <p className="text-xs font-bold text-[#2c2419] mb-2">Layout</p>
              <div className="flex gap-1.5">
                {([{ n: 1, l: "Single" }, { n: 2, l: "Split 2" }, { n: 3, l: "Split 3" }] as const).map(({ n, l }) => (
                  <button
                    key={n}
                    onClick={() => update({ images: Array.from({ length: n }, (_, i) => i < state.images.length ? state.images[i] : { src: null, position: { x: 50, y: 50 } }) })}
                    className={`flex-1 py-2 text-xs font-bold border-2 transition-all ${state.images.length === n ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                  >{l}</button>
                ))}
              </div>
            </div>

            {/* ── Image slots ── */}
            <div className="space-y-2">
              {state.images.length > 1 && (
                <p className="text-[10px] text-[#8b7055] flex items-center gap-1"><GripVertical className="w-3 h-3" /> Drag the handle to reorder</p>
              )}
              {state.images.map((img, idx) => (
                <div
                  key={idx}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx === null || draggedIdx === idx) { setDraggedIdx(null); setDragOverIdx(null); return; }
                    const r = [...state.images]; const [m] = r.splice(draggedIdx, 1); r.splice(idx, 0, m);
                    update({ images: r }); setDraggedIdx(null); setDragOverIdx(null);
                  }}
                  className={`border-2 transition-all ${draggedIdx === idx ? "opacity-30 border-[#8b6834]" : dragOverIdx === idx ? "border-[#8b6834] shadow-md" : "border-[#d4c4b0]"}`}
                >
                  <div className="flex items-stretch">
                    {/* Drag handle */}
                    {state.images.length > 1 && (
                      <div
                        draggable
                        onDragStart={() => setDraggedIdx(idx)}
                        onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                        className="flex items-center px-2 bg-[#f0ebe0] border-r border-[#d4c4b0] text-[#b4a48a] cursor-grab active:cursor-grabbing hover:text-[#8b6834] hover:bg-[#e8dcc8] transition-colors"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="relative group shrink-0 overflow-hidden bg-[#e8dcc8]" style={{ width: 120, height: 75 }}>
                      {img.src ? (
                        <>
                          <img src={img.src} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${img.position.x}% 50%` }} />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                            <label className="bg-white p-1.5 cursor-pointer hover:bg-[#f5f0e8] rounded-sm">
                              <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { update({ images: state.images.map((s, i) => i === idx ? { ...s, src: ev.target?.result as string } : s) }); }; r.readAsDataURL(f); e.target.value = ""; }} />
                              <Upload className="w-3.5 h-3.5 text-[#2c2419]" />
                            </label>
                            <button onClick={() => update({ images: state.images.map((s, i) => i === idx ? { ...s, src: null } : s) })} className="bg-red-500 text-white p-1.5 hover:bg-red-600 rounded-sm">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer gap-1 hover:bg-[#ddd0bc] transition-colors">
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { update({ images: state.images.map((s, i) => i === idx ? { ...s, src: ev.target?.result as string } : s) }); }; r.readAsDataURL(f); e.target.value = ""; }} />
                          <Upload className="w-5 h-5 text-[#8b6834]" />
                          <span className="text-[9px] text-[#8b7055]">Upload</span>
                        </label>
                      )}
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center pointer-events-none">{idx + 1}</span>
                    </div>

                    {/* Focus slider */}
                    <div className="flex-1 flex flex-col justify-center px-3 py-2 gap-1 min-w-0">
                      {img.src ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#2c2419]">Position</span>
                            <span className="text-xs font-bold text-[#8b6834]">{img.position.x}%</span>
                          </div>
                          <input
                            type="range" min="0" max="100" value={img.position.x}
                            onChange={(e) => update({ images: state.images.map((s, i) => i === idx ? { ...s, position: { ...s.position, x: +e.target.value } } : s) })}
                            className="w-full h-2 appearance-none cursor-pointer rounded-full"
                            style={{ background: `linear-gradient(to right,#8b6834 0%,#8b6834 ${img.position.x}%,#e8dcc8 ${img.position.x}%,#e8dcc8 100%)` }}
                          />
                        </>
                      ) : (
                        <span className="text-xs text-[#8b7055]">Click thumbnail to upload</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Seam style – only when >1 image ── */}
            {state.images.length > 1 && (
              <div className="border-t-2 border-[#d4c4b0] pt-4 space-y-4">
                <div>
                  <p className="text-xs font-bold text-[#2c2419] mb-2">Seam Style</p>
                  <div className="flex gap-1.5">
                    {(["border", "blend"] as const).map((mode) => (
                      <button key={mode}
                        onClick={() => update({ splitStyle: { ...state.splitStyle, mode } })}
                        className={`flex-1 py-2 text-xs font-bold border-2 transition-all ${state.splitStyle.mode === mode ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}
                      >{mode === "border" ? "Divider Line" : "Soft Blend"}</button>
                    ))}
                  </div>
                </div>

                {/* Divider controls */}
                {state.splitStyle.mode === "border" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#2c2419]">Line Width</label>
                        <span className="text-xs font-bold text-[#8b6834]">{state.splitStyle.borderWidth} px</span>
                      </div>
                      <input type="range" min="1" max="80" value={state.splitStyle.borderWidth}
                        onChange={(e) => update({ splitStyle: { ...state.splitStyle, borderWidth: +e.target.value } })}
                        className="w-full h-2 appearance-none cursor-pointer rounded-full"
                        style={{ background: `linear-gradient(to right,#8b6834 0%,#8b6834 ${(state.splitStyle.borderWidth/80)*100}%,#e8dcc8 ${(state.splitStyle.borderWidth/80)*100}%,#e8dcc8 100%)` }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2c2419] block mb-1.5">Line Color</label>
                      <div className="flex items-center gap-2 border-2 border-[#d4c4b0] bg-white px-2 py-1.5">
                        <input type="color" value={state.splitStyle.borderColor}
                          onChange={(e) => update({ splitStyle: { ...state.splitStyle, borderColor: e.target.value } })}
                          className="w-8 h-8 border-0 cursor-pointer p-0 shrink-0 rounded"
                        />
                        <input type="text" value={state.splitStyle.borderColor.toUpperCase()} maxLength={7}
                          onChange={(e) => { let v = e.target.value.toUpperCase(); if (!v.startsWith("#")) v="#"+v.replace(/[^0-9A-F]/g,""); else v="#"+v.slice(1).replace(/[^0-9A-F]/g,""); v=v.slice(0,7); if(v.length===7) update({ splitStyle:{...state.splitStyle,borderColor:v} }); }}
                          className="flex-1 text-sm font-mono font-bold text-[#2c2419] bg-transparent outline-none"
                        />
                        <div className="w-7 h-7 rounded border border-[#d4c4b0] shrink-0" style={{ background: state.splitStyle.borderColor }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Blend controls */}
                {state.splitStyle.mode === "blend" && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-[#2c2419]">Fade Width</label>
                        <span className="text-xs font-bold text-[#8b6834]">{state.splitStyle.blendAmount}%</span>
                      </div>
                      <input type="range" min="5" max="50" value={state.splitStyle.blendAmount}
                        onChange={(e) => update({ splitStyle: { ...state.splitStyle, blendAmount: +e.target.value } })}
                        className="w-full h-2 appearance-none cursor-pointer rounded-full"
                        style={{ background: `linear-gradient(to right,#8b6834 0%,#8b6834 ${((state.splitStyle.blendAmount-5)/45)*100}%,#e8dcc8 ${((state.splitStyle.blendAmount-5)/45)*100}%,#e8dcc8 100%)` }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#2c2419] block mb-1.5">Blend Color</label>
                      <div className="flex items-center gap-2 border-2 border-[#d4c4b0] bg-white px-2 py-1.5">
                        <input type="color" value={state.splitStyle.blendColor}
                          onChange={(e) => update({ splitStyle: { ...state.splitStyle, blendColor: e.target.value } })}
                          className="w-8 h-8 border-0 cursor-pointer p-0 shrink-0 rounded"
                        />
                        <input type="text" value={state.splitStyle.blendColor.toUpperCase()} maxLength={7}
                          onChange={(e) => { let v = e.target.value.toUpperCase(); if (!v.startsWith("#")) v="#"+v.replace(/[^0-9A-F]/g,""); else v="#"+v.slice(1).replace(/[^0-9A-F]/g,""); v=v.slice(0,7); if(v.length===7) update({ splitStyle:{...state.splitStyle,blendColor:v} }); }}
                          className="flex-1 text-sm font-mono font-bold text-[#2c2419] bg-transparent outline-none"
                        />
                        <div className="w-7 h-7 rounded border border-[#d4c4b0] shrink-0" style={{ background: state.splitStyle.blendColor }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Logo ── */}
            <div className="border-t-2 border-[#d4c4b0] pt-4 space-y-3">
              <p className="text-xs font-bold text-[#2c2419]">Logo / Channel Icon</p>

              {/* Compact row: small preview + action buttons always visible */}
              <div className="flex items-center gap-3">
                <div className="relative shrink-0 border-2 border-[#d4c4b0] overflow-hidden bg-[#e8dcc8]" style={{ width: 80, height: 52 }}>
                  {state.logo
                    ? <img src={state.logo} alt="Logo" className="w-full h-full object-contain p-1" />
                    : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-[#c4b49a]" strokeWidth={1.5} /></div>
                  }
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="flex items-center justify-center gap-2 py-2 border-2 border-[#8b6834] text-[#8b6834] text-xs font-bold cursor-pointer hover:bg-[#8b6834] hover:text-white transition-all">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = (ev) => { update({ logo: ev.target?.result as string }); }; r.readAsDataURL(f); e.target.value = ""; }} />
                    <Upload className="w-3.5 h-3.5" /> {state.logo ? "Change Logo" : "Upload Logo"}
                  </label>
                  {state.logo && (
                    <button onClick={() => update({ logo: null })} className="flex items-center justify-center gap-2 py-1.5 border-2 border-red-400 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all">
                      <X className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Logo background toggle + color */}
              <div className="flex items-center gap-3 py-2 border-t border-[#e8dcc8]">
                <span className="text-xs font-semibold text-[#2c2419] flex-1">Logo Background</span>
                <button
                  onClick={() => update({ showLogoBackground: !state.showLogoBackground })}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${state.showLogoBackground ? "bg-[#8b6834]" : "bg-[#d4c4b0]"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${state.showLogoBackground ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              {state.showLogoBackground && (
                <div>
                  <label className="text-xs font-semibold text-[#2c2419] block mb-1.5">Background Color</label>
                  <div className="flex items-center gap-2 border-2 border-[#d4c4b0] bg-white px-2 py-1.5">
                    <input type="color" value={state.logoBackground ?? "#ffffff"}
                      onChange={(e) => update({ logoBackground: e.target.value })}
                      className="w-8 h-8 border-0 cursor-pointer p-0 shrink-0 rounded"
                    />
                    <input type="text" value={(state.logoBackground ?? "#ffffff").toUpperCase()} maxLength={7}
                      onChange={(e) => { let v = e.target.value.toUpperCase(); if (!v.startsWith("#")) v="#"+v.replace(/[^0-9A-F]/g,""); else v="#"+v.slice(1).replace(/[^0-9A-F]/g,""); v=v.slice(0,7); if(v.length===7) update({ logoBackground:v }); }}
                      className="flex-1 text-sm font-mono font-bold text-[#2c2419] bg-transparent outline-none"
                    />
                    <div className="w-7 h-7 rounded border border-[#d4c4b0] shrink-0" style={{ background: state.logoBackground ?? "#ffffff" }} />
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* â”€â”€ TEXT â”€â”€ */}
        {activeTab === "Text" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2c2419] tracking-wide font-inter mb-2">HEADLINE TEXT</label>
              <textarea
                value={state.title}
                onChange={(e) => update({ title: e.target.value })}
                rows={3}
                placeholder="Enter your thumbnail title..."
                className="w-full text-sm px-3 py-2 border-2 border-[#d4c4b0] bg-[#faf8f5] text-[#2c2419] font-inter focus:outline-none focus:border-[#8b6834] resize-none"
              />
            </div>

            <div className="border border-[#d4c4b0] overflow-hidden">
              <button
                onClick={() => setExpandedFontSection(expandedFontSection === "headline" ? null : "headline")}
                className="w-full px-3 py-2 flex items-center justify-between bg-[#faf8f5] hover:bg-[#f5f0e8] transition-colors"
              >
                <span className="text-xs font-bold text-[#2c2419] tracking-wide">FONT STYLE</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#5d4e37]">{hl.fontSize} Â· {hl.fontFamily.split(" ")[0]}</span>
                  <svg className={`w-3.5 h-3.5 text-[#8b6834] transition-transform ${expandedFontSection === "headline" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {expandedFontSection === "headline" && (
                <div className="px-3 py-2.5 space-y-2 border-t border-[#f0ebe0]">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Bangla</span>
                    <div className="flex gap-1 flex-1">
                      {BANGLA_FONTS.map((font) => (
                        <button key={font.id} onClick={() => updateFont({ fontFamily: font.id })}
                          className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${hl.fontFamily === font.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">English</span>
                    <div className="flex gap-1 flex-1">
                      {ENGLISH_FONTS.map((font) => (
                        <button key={font.id} onClick={() => updateFont({ fontFamily: font.id })}
                          className={`flex-1 py-1 px-0.5 text-[10px] font-bold border transition-all truncate ${hl.fontFamily === font.id ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Size</span>
                    <input type="range" min="40" max="200" value={parseInt(hl.fontSize)}
                      onChange={(e) => updateFont({ fontSize: `${e.target.value}px` })}
                      className="flex-1 h-1 appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseInt(hl.fontSize) - 40) / 160) * 100}%, #e8dcc8 ${((parseInt(hl.fontSize) - 40) / 160) * 100}%, #e8dcc8 100%)` }}
                    />
                    <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">{hl.fontSize}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Weight</span>
                    <div className="flex gap-1 flex-1">
                      {([["400","N"],["500","M"],["600","S"],["700","B"],["800","XB"]] as const).map(([w, l]) => (
                        <button key={w} onClick={() => updateFont({ fontWeight: w })}
                          className={`flex-1 py-1 text-[10px] font-bold border transition-all ${hl.fontWeight === w ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Color</span>
                    <input type="color" value={hl.color} onChange={(e) => updateFont({ color: e.target.value })}
                      className="h-7 w-9 border border-[#d4c4b0] cursor-pointer shrink-0" />
                    <div className="flex-1 border border-[#d4c4b0] px-2 py-1">
                      <input type="text" value={hl.color.toUpperCase()} maxLength={7}
                        onChange={(e) => {
                          let v = e.target.value.toUpperCase();
                          if (!v.startsWith("#")) v = "#" + v.replace(/[^0-9A-F]/g, "");
                          else v = "#" + v.slice(1).replace(/[^0-9A-F]/g, "");
                          v = v.slice(0, 7);
                          if (v.length === 7) updateFont({ color: v });
                        }}
                        className="w-full text-xs font-mono text-[#2c2419] font-semibold bg-transparent outline-none" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Align</span>
                    <div className="flex gap-1">
                      {(["left", "center", "right"] as const).map((align) => (
                        <button key={align} onClick={() => updateFont({ textAlign: align })}
                          className={`w-7 h-7 flex items-center justify-center border transition-all ${hl.textAlign === align ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#5d4e37] hover:border-[#8b6834]"}`}>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {align === "left" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />}
                            {align === "center" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M5 18h14" />}
                            {align === "right" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M6 18h14" />}
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Shadow</span>
                    <div className="flex gap-1 flex-1">
                      {(["none", "soft", "hard", "glow", "outline"] as const).map((preset) => (
                        <button key={preset}
                          onClick={() => updateFont({ textShadow: { preset, angle: hl.textShadow?.angle ?? 135 } })}
                          className={`flex-1 py-1 text-[10px] font-bold border transition-all capitalize ${(hl.textShadow?.preset ?? "none") === preset ? "border-[#8b6834] bg-[#8b6834] text-white" : "border-[#d4c4b0] text-[#2c2419] hover:border-[#8b6834]"}`}>
                          {preset === "outline" ? "Out" : preset.charAt(0).toUpperCase() + preset.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-[#5d4e37] w-14 shrink-0">Spacing</span>
                    <input type="range" min="-2" max="10" step="0.5" value={parseFloat(hl.letterSpacing ?? "0")}
                      onChange={(e) => updateFont({ letterSpacing: `${e.target.value}px` })}
                      className="flex-1 h-1 appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${((parseFloat(hl.letterSpacing ?? "0") + 2) / 12) * 100}%, #e8dcc8 ${((parseFloat(hl.letterSpacing ?? "0") + 2) / 12) * 100}%, #e8dcc8 100%)` }}
                    />
                    <span className="text-[10px] font-bold text-[#8b6834] w-9 text-right">{hl.letterSpacing}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* â”€â”€ BACKGROUND â”€â”€ */}
        {activeTab === "Background" && (
          <>
            <div>
              <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">
                Text Area Color{" "}
                <span className="text-xs text-[#5d4e37]">
                  ({SOLID_BG_COLORS.length + customBgColors.length}/7 colors)
                </span>
              </h3>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {SOLID_BG_COLORS.map((item) => (
                  <button key={item.color} onClick={() => update({ textBackground: item.color })}
                    className={`relative w-14 h-14 flex-shrink-0 border-2 transition-all overflow-hidden ${state.textBackground === item.color ? "border-[#8b6834] shadow-md" : "border-[#d4c4b0] hover:scale-95"}`}
                    style={{ backgroundColor: item.color }} title={item.name}>
                    {state.textBackground === item.color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">selected</div>
                    )}
                  </button>
                ))}
                {customBgColors.map((color, index) => (
                  <button key={`custom-${index}`} onClick={() => update({ textBackground: color })}
                    className={`relative w-14 h-14 border-2 transition-all overflow-visible flex-shrink-0 group ${state.textBackground === color ? "border-[#8b6834] shadow-md" : "border-[#d4c4b0] hover:scale-95"}`}
                    style={{ backgroundColor: color }}>
                    {state.textBackground === color && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#8b6834] text-[#faf8f5] text-[10px] font-inter text-center py-0.5">selected</div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setEditingBgColorIndex(index); setTempBgColor(color); setShowBgColorPicker(true); }}
                      className="absolute top-1 left-1 w-4 h-4 bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 z-10 text-[10px]">âœŽ</button>
                    <button onClick={(e) => { e.stopPropagation(); setCustomBgColors((prev) => prev.filter((_, i) => i !== index)); }}
                      className="absolute top-1 right-1 w-4 h-4 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 z-10">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </button>
                ))}
                {customBgColors.length < 2 && (
                  <button onClick={() => { setEditingBgColorIndex(null); setTempBgColor("#000000"); setShowBgColorPicker(!showBgColorPicker); }}
                    className="relative w-14 h-14 flex-shrink-0 border-2 border-dashed border-[#8b6834] bg-[#faf8f5] hover:bg-[#e8dcc8] transition-all flex items-center justify-center">
                    <Plus className="w-5 h-5 text-[#8b6834]" />
                  </button>
                )}
              </div>

              {showBgColorPicker && (
                <div className="mt-3 bg-[#faf8f5] border-2 border-[#8b6834] p-4 shadow-md">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-[#2c2419] font-inter">
                      {editingBgColorIndex !== null ? "Edit Custom Color" : "Pick a custom color"}
                    </label>
                    <button onClick={() => { setShowBgColorPicker(false); setEditingBgColorIndex(null); }} className="text-[#5d4e37] hover:text-[#2c2419]">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex gap-3">
                    <input type="color" value={tempBgColor} onChange={(e) => setTempBgColor(e.target.value)}
                      className="h-12 w-20 border-2 border-[#d4c4b0] cursor-pointer shadow-sm" />
                    <div className="flex-1 bg-white border-2 border-[#d4c4b0] px-4 py-3 flex items-center">
                      <input type="text" value={tempBgColor.toUpperCase()} maxLength={7}
                        onChange={(e) => {
                          let value = e.target.value.toUpperCase();
                          if (!value.startsWith("#")) value = "#" + value.replace(/[^0-9A-F]/g, "");
                          else value = "#" + value.slice(1).replace(/[^0-9A-F]/g, "");
                          value = value.slice(0, 7);
                          setTempBgColor(value);
                        }}
                        onBlur={(e) => { if (!/^#[0-9A-F]{6}$/i.test(e.target.value)) setTempBgColor("#000000"); }}
                        placeholder="#000000"
                        className="w-full text-sm font-mono text-[#2c2419] font-semibold bg-transparent outline-none" />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (tempBgColor.length === 7) {
                        if (editingBgColorIndex !== null) {
                          setCustomBgColors((prev) => prev.map((c, i) => (i === editingBgColorIndex ? tempBgColor : c)));
                        } else if (customBgColors.length < 2 && !customBgColors.includes(tempBgColor)) {
                          setCustomBgColors((prev) => [...prev, tempBgColor]);
                        }
                        update({ textBackground: tempBgColor });
                        setShowBgColorPicker(false);
                        setTempBgColor("#000000");
                        setEditingBgColorIndex(null);
                      }
                    }}
                    className="w-full mt-3 py-2 bg-[#8b6834] text-[#faf8f5] font-inter font-semibold hover:bg-[#2c2419] transition-colors"
                    disabled={tempBgColor.length !== 7}>
                    {editingBgColorIndex !== null ? "Update Color" : "Add Color"}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* â”€â”€ PATTERN â”€â”€ */}
        {activeTab === "Pattern" && (
          <div className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">Select Pattern</h3>
                <div className="grid grid-cols-4 gap-3">
                  {PATTERNS.map((pattern) => {
                    const isActive = state.pattern.pattern === pattern.id;
                    return (
                      <button key={pattern.id}
                        onClick={() => {
                          if (pattern.id === "custom") { customPatternRef.current?.click(); }
                          else { updatePattern({ pattern: pattern.id as BackgroundOptions["pattern"], patternOpacity: state.pattern.patternOpacity || 0.3 }); }
                        }}
                        className={`aspect-square flex flex-col items-center justify-center p-2 border-2 transition-all overflow-hidden relative ${isActive ? "border-[#8b6834] bg-[#e8dcc8]" : "border-[#d4c4b0] bg-[#faf8f5] hover:border-[#8b6834]"}`}>
                        <div className="w-full h-full mb-1 border border-black/5 overflow-hidden bg-white/50 relative">
                          {pattern.id === "none" && <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">None</div>}
                          {pattern.id === "custom" && <div className="absolute inset-0 flex items-center justify-center"><Upload className="w-4 h-4 text-[#5d4e37]" /></div>}
                          {pattern.id === "p-duo" && <div className="absolute inset-0" style={{ backgroundImage: "url(/patterns/p-duo.png)", backgroundSize: "cover", backgroundPosition: "center" }} />}
                        </div>
                        <span className={`text-[10px] font-medium leading-tight ${isActive ? "text-[#2c2419]" : "text-[#5d4e37]"}`}>{pattern.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <input ref={customPatternRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => { updatePattern({ pattern: "custom", patternImage: reader.result as string }); };
                  reader.readAsDataURL(file);
                  e.target.value = "";
                }}
              />

              {state.pattern.pattern === "custom" && (
                <div className="bg-[#e8dcc8] p-4 border border-[#d4c4b0]">
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-2">Upload Pattern Image</h3>
                  <label className="block border-2 border-dashed border-[#8b6834]/50 bg-[#faf8f5] hover:bg-white transition-colors cursor-pointer p-6 text-center">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { const reader = new FileReader(); reader.onloadend = () => { updatePattern({ patternImage: reader.result as string }); }; reader.readAsDataURL(file); }
                      }}
                    />
                    <Upload className="w-5 h-5 mx-auto mb-2 text-[#8b6834]" />
                    <p className="text-xs text-[#5d4e37] font-medium">Click to upload image</p>
                    <p className="text-[10px] text-[#5d4e37]/70 mt-1">Supports PNG, JPG (will be used as overlay)</p>
                  </label>
                  {state.pattern.patternImage && (
                    <div className="mt-2 text-xs text-green-700 flex items-center gap-1 font-medium">
                      <div className="w-2 h-2 bg-green-500" /> Image loaded successfully
                    </div>
                  )}
                </div>
              )}

              {state.pattern.pattern && state.pattern.pattern !== "none" && (
                <div>
                  <h3 className="text-sm font-medium font-inter text-[#2c2419] mb-3">Opacity</h3>
                  <div className="flex items-center gap-4">
                    <input type="range" min="0.05" max="0.8" step="0.05"
                      value={state.pattern.patternOpacity ?? 0.3}
                      onChange={(e) => updatePattern({ patternOpacity: parseFloat(e.target.value) })}
                      className="flex-1 h-1 bg-[#e8dcc8] appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #8b6834 0%, #8b6834 ${(((state.pattern.patternOpacity ?? 0.3) - 0.05) / 0.75) * 100}%, #e8dcc8 ${(((state.pattern.patternOpacity ?? 0.3) - 0.05) / 0.75) * 100}%, #e8dcc8 100%)` }}
                    />
                    <div className="w-12 text-right text-md font-medium font-inter text-[#2c2419]">
                      {Math.round((state.pattern.patternOpacity ?? 0.3) * 100)}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
