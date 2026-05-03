import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--dm-sans",
});
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import FloatingSupport from "@/components/FloatingSupport";
import WhatsNewToast from "@/components/WhatsNewToast";

const SITE_URL = "https://newscard.live";
const SITE_NAME = "Newscard";
const OG_IMAGE = `${SITE_URL}/icons/logo.png`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Newscard – Create Stunning Social Cards in Seconds",
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Design beautiful news cards, URL previews, recipe cards, followers cards, health cards, and more. Perfect for journalists, educators, and content creators in Bangladesh and beyond.",
  keywords: [
    "news card generator",
    "social card maker",
    "recipe card generator",
    "followers card maker",
    "health card maker",
    "Islamic quote card",
    "Bangla news card",
    "photocard generator",
    "URL preview card",
    "social media card",
    "content creator tool",
    "Bangladesh news card",
    "বাংলা নিউজকার্ড",
    "নিউজকার্ড জেনারেটর",
  ],
  authors: [{ name: "Newscard", url: SITE_URL }],
  creator: "Newscard",
  publisher: "Newscard",
  category: "Technology",
  applicationName: SITE_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Newscard – Create Stunning Social Cards in Seconds",
    description:
      "Design beautiful news cards, Islamic quote cards, URL previews, video thumbnails, and more — in seconds. Try free.",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Newscard – Social Card Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Newscard – Create Stunning Social Cards in Seconds",
    description:
      "Design beautiful news cards, Islamic quote cards, URL previews, and more — in seconds. Try free.",
    images: [OG_IMAGE],
    creator: "@newscardapp",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icons/logo.png",
  },
  manifest: "/manifest.json",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f5" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1208" },
  ],
  colorScheme: "light dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    // Add your Google Search Console verification token here when available:
    // google: "your-google-verification-token",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Newscard",
  url: SITE_URL,
  description:
    "Create beautiful news cards, URL preview cards, recipe cards, followers cards, and health cards. Full Bangla text support. Perfect for content creators in Bangladesh.",
  applicationCategory: "DesignApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "BDT",
    lowPrice: "0",
    highPrice: "449",
    offerCount: "3",
  },
  featureList: [
    "News card generator",
    "URL preview card",
    "Recipe card maker",
    "Followers card maker",
    "Health card maker",
    "Islamic quote card maker",
    "Bangla text support",
    "AI-powered content",
    "Background remover",
    "High-resolution export",
  ],
  inLanguage: ["en", "bn"],
  audience: {
    "@type": "Audience",
    audienceType: "Content Creators, Journalists, Educators",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased font-dm-sans">
        <LanguageProvider>
          <AuthProvider>
            {children}
            <WhatsNewToast />
            <FloatingSupport />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
