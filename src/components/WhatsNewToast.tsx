"use client";

import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Notification Types ───────────────────────────────────────────────────────

interface CardNotification {
  id: string;
  type: "card";
  badge: string;
  title: string;
  description: string;
  /** Path to a thumbnail image (optional). Falls back to CSS preview. */
  thumbnail?: string;
  /** Tailwind/inline bg colour used when no thumbnail image is set */
  thumbnailBg?: string;
  /** Short label rendered inside the CSS preview box */
  thumbnailLabel?: string;
  /** Route to navigate to */
  link?: string;
}

interface UpdateNotification {
  id: string;
  type: "update";
  badge?: string;
  title: string;
  /** Each string becomes a bullet-point */
  items: string[];
}

type Notification = CardNotification | UpdateNotification;

// ─── Notification Data ────────────────────────────────────────────────────────
// Edit this array to add / remove toasts for future releases.
// Use unique `id` per entry so localStorage tracks dismissals correctly.

const NOTIFICATIONS: Notification[] = [
  {
    id: "card-url-banner-v1",
    type: "card",
    badge: "New Card",
    title: "New Banner URL Card 🎉",
    description:
      "Organic wavy SVG banner with gradient fill, dark grid overlay and a bold headline. Available on the URL Card page.",
    thumbnail: "/themes/cus-9.png",
    link: "/url",
  },
  {
    id: "card-url-blend-v1",
    type: "card",
    badge: "New Card",
    title: "New Blend URL Card 🎉",
    description:
      "Clean white text section that seamlessly blends into the article image below, with alternating headline colours. Available on the URL Card page.",
    thumbnail: "/themes/cus-10.png",
    link: "/url",
  },
  {
    id: "card-comment-portrait-v1",
    type: "card",
    badge: "New Card",
    title: "New Portrait Card 🎉",
    thumbnail: "/themes/com-5.png",
    description:
      "Dark portrait-style quote card with a bold accent panel, word highlight feature and a customisable background colour. Available on the Comment Card page.",
    link: "/comment",
  },
  {
    id: "card-comment-quoteframe-v1",
    type: "card",
    badge: "New Card",
    title: "New Quote Card 🎉",
    thumbnail: "/themes/com-6.png",
    description:
      "Elegant frame-shaped quote card with a clipped person image, paper-texture background and customisable background colour. Available on the Comment Card page.",
    link: "/comment",
  },
  {
    id: "update-march-2026",
    type: "update",
    badge: "Update",
    title: "What's new in March 2026 🎉",
    items: [
      "YouTube Thumbnail Creator 🖼️",
      "Browse news from 🛜 RSS Feeds",
      "Remix news & images with AI ✨",
      "AI content variations in Editor Toolbar",
      "Background Remover tool 🧹",
      "Bangla Converter 🇧🇩",
    ],
  },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = "whatsNewDismissed";

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function persistDismissed(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToastShell({
  children,
  onClose,
  index,
}: {
  children: React.ReactNode;
  onClose: () => void;
  index: number;
}) {
  const [dismissing, setDismissing] = useState(false);

  const handleClose = () => setDismissing(true);

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    if (e.animationName === "slideOutRight") onClose();
  };

  return (
    <div
      className={`relative w-[340px] bg-[#faf8f5] border border-[#d4c4b0] shadow-2xl ${
        dismissing ? "animate-slideOutRight" : "animate-slideInRight"
      }`}
      style={dismissing ? undefined : { animationDelay: `${index * 0.18}s` }}
      onAnimationEnd={handleAnimationEnd}
    >
      <button
        onClick={handleClose}
        className="absolute top-2.5 right-2.5 p-1 text-[#5d4e37] hover:bg-[#e8dcc8] transition-colors z-10"
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
      {children}
    </div>
  );
}

function CardToast({
  n,
  onClose,
  index,
}: {
  n: CardNotification;
  onClose: () => void;
  index: number;
}) {
  const thumb = (
    <div
      className="relative w-[80px] h-[80px] shrink-0 border border-[#d4c4b0] overflow-hidden bg-[#e8dcc8]"
      style={!n.thumbnail ? { background: n.thumbnailBg ?? "#8b6834" } : undefined}
    >
      {n.thumbnail ? (
        <Image
          src={n.thumbnail}
          alt={n.title}
          fill
          className="object-cover"
          sizes="80px"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm tracking-wider drop-shadow-sm">
          {n.thumbnailLabel ?? "NEW"}
        </span>
      )}
    </div>
  );

  const content = (
    <div className="flex gap-3 items-start p-3 pr-8">
      {thumb}
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[#2c2419] font-semibold text-sm leading-snug">
          {n.title}
        </p>
        <p className="text-[#5d4e37] text-[11px] leading-relaxed line-clamp-2 opacity-80">
          {n.description}
        </p>
        {n.link && (
          <Link
            href={n.link}
            className="inline-flex items-center gap-1 text-[#8b6834] text-[11px] font-medium mt-1 hover:underline"
          >
            Check it out <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <ToastShell onClose={onClose} index={index}>
      {content}
    </ToastShell>
  );
}

function UpdateToast({
  n,
  onClose,
  index,
}: {
  n: UpdateNotification;
  onClose: () => void;
  index: number;
}) {
  return (
    <ToastShell onClose={onClose} index={index}>
      <div className="p-3 pr-8 space-y-2">
        <p className="text-[#2c2419] font-semibold text-sm leading-snug">
          {n.title}
        </p>
        <ul className="space-y-0.5">
          {n.items.map((item, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-[#5d4e37]">
              <span className="text-[#8b6834] mt-0.5 shrink-0">•</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </ToastShell>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WhatsNewToast() {
  const [visible, setVisible] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = getDismissed();
    const toShow = NOTIFICATIONS.map((n) => n.id).filter(
      (id) => !dismissed.includes(id)
    );
    setVisible(toShow);
  }, []);

  const dismiss = (id: string) => {
    setVisible((prev) => {
      const next = prev.filter((v) => v !== id);
      const dismissed = getDismissed();
      if (!dismissed.includes(id)) {
        persistDismissed([...dismissed, id]);
      }
      return next;
    });
  };

  if (!mounted || visible.length === 0) return null;

  const activeNotifications = NOTIFICATIONS.filter((n) =>
    visible.includes(n.id)
  );

  return (
    <div className="fixed top-[80px] md:top-[92px] right-4 z-[90] flex flex-col gap-2 font-dm-sans">
      {activeNotifications.map((n, i) =>
        n.type === "card" ? (
          <CardToast key={n.id} n={n} index={i} onClose={() => dismiss(n.id)} />
        ) : (
          <UpdateToast key={n.id} n={n} index={i} onClose={() => dismiss(n.id)} />
        )
      )}
    </div>
  );
}
