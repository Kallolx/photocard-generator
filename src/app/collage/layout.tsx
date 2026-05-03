import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photo Collage Maker",
  description:
    "Create beautiful photo collages for social media. Combine multiple images into a stunning collage card — quick and easy.",
  alternates: {
    canonical: "https://newscard.live/collage",
  },
  openGraph: {
    title: "Photo Collage Maker | Newscard",
    description: "Combine multiple images into a stunning collage card for social media.",
    url: "https://newscard.live/collage",
  },
};

export default function CollageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
