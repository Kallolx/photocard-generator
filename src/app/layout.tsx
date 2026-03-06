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

export const metadata: Metadata = {
  title: "Photocard Generator - Transform Articles into Visual Cards",
  description:
    "Generate beautiful photocards from news articles. Extract title, image, and create QR codes automatically.",
  keywords: "photocard, news, generator, qr code, article, visual, card",
  authors: [{ name: "Photocard Generator" }],
  viewport: "width=device-width, initial-scale=1",
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
