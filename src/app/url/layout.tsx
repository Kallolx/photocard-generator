import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "URL Preview Card Generator",
  description:
    "Generate beautiful URL preview cards from any link. Perfect for sharing articles, blog posts, and web pages on social media with a stunning visual preview.",
  keywords: [
    "URL preview card",
    "link preview generator",
    "URL card maker",
    "social media link preview",
    "Open Graph card",
  ],
  alternates: {
    canonical: "https://newscard-generator.vercel.app/url",
  },
  openGraph: {
    title: "URL Preview Card Generator | Newscard",
    description: "Generate beautiful link preview cards from any URL for social media sharing.",
    url: "https://newscard-generator.vercel.app/url",
  },
};

export default function UrlLayout({ children }: { children: React.ReactNode }) {
  return children;
}
