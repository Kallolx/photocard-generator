import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live News Card Generator",
  description:
    "Browse live Bangladeshi news and convert any article into a stunning shareable news card in seconds. Perfect for journalists and social media managers.",
  keywords: [
    "news card generator",
    "Bangla news card",
    "Bangladesh news",
    "social media news card",
    "automatic news card",
    "বাংলা নিউজ কার্ড",
  ],
  alternates: {
    canonical: "https://newscard-generator.vercel.app/news",
  },
  openGraph: {
    title: "Live News Card Generator | Newscard",
    description: "Browse live Bangladeshi news and create shareable social cards instantly.",
    url: "https://newscard-generator.vercel.app/news",
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
