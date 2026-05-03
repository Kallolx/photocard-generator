import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://newscard.live";

export const metadata: Metadata = {
  title: "New Recipe Card",
  description: "Create editorial recipe cards with ingredients, steps, and serving notes.",
  alternates: {
    canonical: `${SITE_URL}/recipe`,
  },
  openGraph: {
    title: "New Recipe Card | Newscard",
    description: "Create editorial recipe cards with ingredients, steps, and serving notes.",
    url: `${SITE_URL}/recipe`,
    type: "website",
  },
};

export default function RecipeLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}