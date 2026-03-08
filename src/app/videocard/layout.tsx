import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video Thumbnail Card Maker",
  description:
    "Create eye-catching video thumbnail cards for YouTube, Facebook, and other platforms. Professional video card designs in seconds.",
  keywords: [
    "video thumbnail maker",
    "video card generator",
    "YouTube thumbnail maker",
    "Facebook video card",
    "video thumbnail creator",
  ],
  alternates: {
    canonical: "https://newscard-generator.vercel.app/videocard",
  },
  openGraph: {
    title: "Video Thumbnail Card Maker | Newscard",
    description: "Create professional video thumbnail cards for YouTube, Facebook, and social media.",
    url: "https://newscard-generator.vercel.app/videocard",
  },
};

export default function VideoCardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
