import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account",
  description:
    "Sign up free and start creating stunning news cards, Islamic quote cards, URL preview cards, and video thumbnails. No credit card required.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/auth/signup",
  },
  openGraph: {
    title: "Create Free Account | Newscard",
    description: "Sign up free and create professional social cards in seconds. No credit card required.",
    url: "https://newscard-generator.vercel.app/auth/signup",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
