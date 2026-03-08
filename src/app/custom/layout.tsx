import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Social Card Creator",
  description:
    "Create a fully custom social media card from scratch. Choose your layout, upload images, add text, and customize every detail.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/custom",
  },
  openGraph: {
    title: "Custom Social Card Creator | Newscard",
    description: "Design a fully custom social card. Unlimited creative freedom.",
    url: "https://newscard-generator.vercel.app/custom",
  },
};

export default function CustomLayout({ children }: { children: React.ReactNode }) {
  return children;
}
