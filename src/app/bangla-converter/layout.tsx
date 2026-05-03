import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bangla Text Converter",
  description:
    "Convert English text to Bangla (Bengali) script instantly. Free online Bangla typing tool with automatic transliteration support.",
  keywords: [
    "Bangla converter",
    "Bengali text converter",
    "English to Bangla",
    "Bangla typing tool",
    "বাংলা কনভার্টার",
    "ইংরেজি থেকে বাংলা",
  ],
  alternates: {
    canonical: "https://newscard.live/bangla-converter",
  },
  openGraph: {
    title: "Bangla Text Converter | Newscard",
    description: "Convert English text to Bangla instantly. Free online Bangla typing and transliteration tool.",
    url: "https://newscard.live/bangla-converter",
  },
};

export default function BanglaConverterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
