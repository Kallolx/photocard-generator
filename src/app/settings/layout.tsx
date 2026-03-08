import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your Newscard account settings, profile, and subscription.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
