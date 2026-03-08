import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Background Remover",
  description:
    "Remove backgrounds from images instantly using AI — free online tool. Perfect for creating professional-looking news cards and social media visuals.",
  keywords: [
    "background remover",
    "remove background",
    "AI background removal",
    "free background remover",
    "photo background remove",
  ],
  alternates: {
    canonical: "https://newscard-generator.vercel.app/background-remover",
  },
  openGraph: {
    title: "AI Background Remover | Newscard",
    description: "Remove backgrounds from images instantly using AI — free and fast.",
    url: "https://newscard-generator.vercel.app/background-remover",
  },
};

export default function BackgroundRemoverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
