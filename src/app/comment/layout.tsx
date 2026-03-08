import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comment Card Generator",
  description:
    "Turn social media comments into beautiful shareable visual cards. Perfect for highlighting testimonials and audience reactions.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/comment",
  },
  openGraph: {
    title: "Comment Card Generator | Newscard",
    description: "Turn comments and testimonials into beautiful shareable visual cards.",
    url: "https://newscard-generator.vercel.app/comment",
  },
};

export default function CommentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
