import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 },
      );
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch webpage" },
        { status: 500 },
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    // Priority: Schema.org Headline -> H1 -> OG Title -> Twitter Title -> standard Title

    // Strategy 1: Schema.org JSON-LD Headline
    let schemaTitle = "";
    try {
      $('script[type="application/ld+json"]').each((i, el) => {
        if (schemaTitle) return;
        try {
          const json = JSON.parse($(el).html() || "{}");
          const schemas = Array.isArray(json) ? json : json["@graph"] || [json];

          for (const item of schemas) {
            const type = Array.isArray(item["@type"])
              ? item["@type"]
              : [item["@type"]];
            if (
              type.some((t) =>
                ["Article", "NewsArticle", "BlogPosting", "Report"].includes(t),
              )
            ) {
              if (item.headline) {
                schemaTitle = item.headline;
              } else if (item.name) {
                schemaTitle = item.name;
              }
            }
          }
        } catch (e) {}
      });
    } catch (e) {}

    // Helper to decode HTML entities
    const decodeHtml = (str: string) => {
      if (!str) return "";
      return cheerio.load(str).text();
    };

    let title =
      decodeHtml(schemaTitle) ||
      $("h1").first().text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text();

    if (title) {
      // Decode any remaining entities (sometimes one pass isn't enough if mixed sources)
      // But mainly to catch cases where .attr('content') returns encoded text
      if (title.includes("&")) {
        title = decodeHtml(title);
      }

      title = title.trim();

      // Specific cleanup for known noisy sites
      // clean "Prominent Bengali News portal" garbage found on deshnews.net
      title = title.replace(/^Prominent Bengali News portal/i, "").trim();

      // Cleanup: Remove common site name separators usually found at the end or start
      // e.g. "Article Title | Site Name" or "Site Name - Article Title"

      const separators = [" | ", " || ", " - ", " :: ", " / "];

      // Heuristic: If we find a separator, we might want to keep the longest part
      // or the part that typically looks like a title.
      // For now, let's try to remove trailing site names which is most common.

      for (const sep of separators) {
        if (title.includes(sep)) {
          const parts = title.split(sep);
          // Usually the longest part is the actual title
          // But strict logic: mostly the first part is title, second is site name (suffix)
          // OR first part is site name, second is title (prefix)

          // Let's pick the longest segment as safely as possible
          title = parts.reduce((a, b) => (a.length >= b.length ? a : b)).trim();
          break; // Only split by the first detected major separator
        }
      }
    }

    title = title || "No title found";

    // Extract main image
    let image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $("img").first().attr("src");

    // Make image URL absolute if it's relative
    // Make image URL absolute if it's relative
    if (image) image = image.trim();

    if (image && !image.startsWith("http")) {
      const baseUrl = new URL(url);
      if (image.startsWith("//")) {
        image = baseUrl.protocol + image;
      } else if (image.startsWith("/")) {
        image = baseUrl.origin + image;
      } else {
        image = baseUrl.origin + "/" + image;
      }
    }

    // Extract main website logo
    let logo =
      $('img[alt*="logo" i]').first().attr("src") ||
      $('img[class*="logo" i]').first().attr("src") ||
      $('img[id*="logo" i]').first().attr("src") ||
      $(".logo img").first().attr("src") ||
      $("#logo img").first().attr("src") ||
      $("header img").first().attr("src") ||
      $(".header img").first().attr("src") ||
      $(".brand img").first().attr("src") ||
      $(".navbar-brand img").first().attr("src") ||
      $("nav img").first().attr("src") ||
      $(".navbar img").first().attr("src") ||
      $(".site-logo img").first().attr("src") ||
      $(".site-branding img").first().attr("src") ||
      $("img")
        .filter((i, el) => {
          const src = $(el).attr("src") || "";
          const alt = $(el).attr("alt") || "";
          const className = $(el).attr("class") || "";
          const id = $(el).attr("id") || "";
          return (
            (src.toLowerCase().includes("logo") &&
              !src.toLowerCase().includes("article")) ||
            (alt.toLowerCase().includes("logo") &&
              !alt.toLowerCase().includes("article")) ||
            (className.toLowerCase().includes("logo") &&
              !className.toLowerCase().includes("article")) ||
            (id.toLowerCase().includes("logo") &&
              !id.toLowerCase().includes("article"))
          );
        })
        .first()
        .attr("src") ||
      // Try to find images in header/navigation areas that are likely logos
      $("header img, .header img, nav img, .nav img, .navbar img")
        .filter((i, el) => {
          const width = parseInt($(el).attr("width") || "0");
          const height = parseInt($(el).attr("height") || "0");
          const src = $(el).attr("src") || "";
          // Skip if it's likely a social media icon or very small image
          if (width > 0 && height > 0 && (width < 16 || height < 16))
            return false;
          if (
            src.includes("facebook") ||
            src.includes("twitter") ||
            src.includes("instagram") ||
            src.includes("youtube")
          )
            return false;
          return true;
        })
        .first()
        .attr("src");

    // Make logo URL absolute if it's relative
    if (logo) logo = logo.trim();

    if (logo && !logo.startsWith("http")) {
      const baseUrl = new URL(url);
      if (logo.startsWith("//")) {
        logo = baseUrl.protocol + logo;
      } else if (logo.startsWith("/")) {
        logo = baseUrl.origin + logo;
      } else {
        logo = baseUrl.origin + "/" + logo;
      }
    }

    // Extract favicon as fallback
    let favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    // Make favicon URL absolute if it's relative
    if (favicon) favicon = favicon.trim();

    if (favicon && !favicon.startsWith("http")) {
      const baseUrl = new URL(url);
      if (favicon.startsWith("//")) {
        favicon = baseUrl.protocol + favicon;
      } else if (favicon.startsWith("/")) {
        favicon = baseUrl.origin + favicon;
      } else {
        favicon = baseUrl.origin + "/" + favicon;
      }
    }

    // Extract site name for logo
    let siteName =
      $('meta[property="og:site_name"]').attr("content") ||
      $('meta[name="application-name"]').attr("content") ||
      new URL(url).hostname.replace("www.", "");

    console.log("Extracted data:", { title, image, logo, favicon, siteName });

    return NextResponse.json({
      title,
      image,
      logo: logo || favicon,
      favicon,
      siteName,
      url,
    });
  } catch (error) {
    console.error("Error extracting URL data:", error);
    return NextResponse.json(
      { error: "Failed to extract URL data" },
      { status: 500 },
    );
  }
}
