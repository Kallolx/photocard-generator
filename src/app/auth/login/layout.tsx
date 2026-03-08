import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your Newscard account to start creating stunning news cards, Islamic quote cards, and social media visuals.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/auth/login",
  },
  openGraph: {
    title: "Sign In | Newscard",
    description: "Sign in to your Newscard account and start creating beautiful social cards.",
    url: "https://newscard-generator.vercel.app/auth/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
