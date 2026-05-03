import type { Metadata } from "next";
import type { ReactNode } from "react";

const SITE_URL = "https://newscard.live";

export const metadata: Metadata = {
  title: "Followers Card",
  description: "Create milestone cards for audience growth and community updates.",
  alternates: {
    canonical: `${SITE_URL}/followers`,
  },
  openGraph: {
    title: "Followers Card | Newscard",
    description: "Create milestone cards for audience growth and community updates.",
    url: `${SITE_URL}/followers`,
    type: "website",
  },
};

export default function FollowersLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}