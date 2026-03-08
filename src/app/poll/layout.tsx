import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poll Card Generator",
  description:
    "Create engaging poll cards to share on social media. Display your poll questions and results in a beautiful visual format.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/poll",
  },
  openGraph: {
    title: "Poll Card Generator | Newscard",
    description: "Create shareable poll cards to engage your audience on social media.",
    url: "https://newscard-generator.vercel.app/poll",
  },
};

export default function PollLayout({ children }: { children: React.ReactNode }) {
  return children;
}
