import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Newscard team for support, partnership inquiries, or enterprise plans. We're here to help.",
  alternates: {
    canonical: "https://newscard-generator.vercel.app/contact",
  },
  openGraph: {
    title: "Contact Us | Newscard",
    description: "Reach out to Newscard for support, partnerships, or enterprise pricing.",
    url: "https://newscard-generator.vercel.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
