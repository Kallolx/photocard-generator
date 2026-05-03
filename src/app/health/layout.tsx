import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://newscard.live";

export const metadata: Metadata = {
  title: "Health Card",
  description: "Create wellness cards for tips, reminders, and health updates.",
  alternates: {
    canonical: `${SITE_URL}/health`,
  },
  openGraph: {
    title: "Health Card | Newscard",
    description: "Create wellness cards for tips, reminders, and health updates.",
    url: `${SITE_URL}/health`,
    type: "website",
  },
};

export default function HealthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}