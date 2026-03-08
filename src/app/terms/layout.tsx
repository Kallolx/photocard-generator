import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Newscard Terms of Service — the rules and conditions governing the use of our social card generation platform.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/terms",
  },
  robots: { index: true, follow: true },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
