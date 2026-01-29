"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClassicUrlCard from "@/components/cards/url-cards/ClassicUrlCard";
import ModernUrlCard from "@/components/cards/url-cards/ModernUrlCard";
import { BackgroundOptions, PhotocardData } from "@/types";

function CardRenderer() {
  const searchParams = useSearchParams();

  // Parse Query Parameters
  const url = searchParams.get("url") || "";
  const theme = searchParams.get("theme") || "classic";

  // Data Params
  const title = searchParams.get("title") || "No Title";
  const image = searchParams.get("image") || ""; // Should be a valid image URL
  const logo = searchParams.get("logo") || "";
  const favicon = searchParams.get("favicon") || "";
  const siteName = searchParams.get("siteName") || "Example Site";
  const weekName = searchParams.get("weekName") || "";
  const date = searchParams.get("date") || "";

  // Styling Params
  const bgType = searchParams.get("bgType") || "solid";
  const bgColor = searchParams.get("bgColor") || "#FFFFFF";
  const bgFrom = searchParams.get("bgFrom") || "#FFFFFF";
  const bgTo = searchParams.get("bgTo") || "#000000";
  const pattern = searchParams.get("pattern") || "none";
  const patternColor = searchParams.get("patternColor") || "#000000";
  const patternOpacity = parseFloat(
    searchParams.get("patternOpacity") || "0.1",
  );

  const frameColor = searchParams.get("frameColor") || "#FFFFFF";
  const frameThickness = parseInt(searchParams.get("frameThickness") || "0");

  const isDesktop = searchParams.get("isDesktop") === "true";

  // Construct Objects
  const photocardData: PhotocardData = {
    url,
    title,
    image,
    logo,
    favicon,
    siteName,
    weekName,
    date,
  };

  const background: BackgroundOptions = {
    type: bgType as "solid" | "gradient",
    color: bgColor,
    gradientFrom: bgFrom,
    gradientTo: bgTo,
    pattern: pattern,
    patternColor: patternColor,
    patternOpacity: patternOpacity,
    // Note: custom pattern images via URL might need proxying/handling if CORS issues arise in puppeteer
  };

  // Ad Banner
  const adBannerImage = searchParams.get("adBanner") || null;

  // Render
  return (
    <div
      id="card-container"
      style={{
        display: "inline-block", // Shrink fit
        padding: "20px",
        backgroundColor: "transparent", // Ensure background is transparent so we only capture the card
      }}
    >
      {theme === "modern" ? (
        <ModernUrlCard
          data={photocardData}
          background={background}
          fullSize={true}
          frameBorderColor={frameColor}
          frameBorderThickness={frameThickness}
          adBannerImage={adBannerImage}
        />
      ) : (
        <ClassicUrlCard
          data={photocardData}
          background={background}
          fullSize={true}
          frameBorderColor={frameColor}
          frameBorderThickness={frameThickness}
          adBannerImage={adBannerImage}
        />
      )}
    </div>
  );
}

export default function RenderPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CardRenderer />
    </Suspense>
  );
}
