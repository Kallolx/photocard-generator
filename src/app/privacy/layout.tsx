import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Newscard Privacy Policy to understand how we collect, use, and protect your personal data.",
  alternates: {
    canonical: "https://newscard.live/privacy",
  },
  robots: { index: true, follow: true },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
