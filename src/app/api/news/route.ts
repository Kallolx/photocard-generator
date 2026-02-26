import { NextResponse } from "next/server";
import Parser from "rss-parser";

export const revalidate = 900; // Cache the response for 15 minutes (900 seconds)

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
      ["enclosure", "enclosure"],
      ["image", "image"],
      ["category", "category"],
    ],
  },
});

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  contentSnippet: string;
  imageUrl?: string;
  faviconUrl?: string;
  category?: string;
}

const RSS_FEEDS = [
  { name: "BD24Live", url: "https://www.bd24live.com/feed" },
  {
    name: "bdnews24",
    url: "https://bdnews24.com/?widgetName=rssfeed&widgetId=1150&getXmlFeed=true",
  },
  { name: "Bangla News 24", url: "https://www.banglanews24.com/rss/rss.xml" },
  { name: "Jugantor", url: "https://www.jugantor.com/feed/rss.xml" },
  { name: "Bangladesh Pratidin", url: "https://www.bd-pratidin.com/rss.xml" },
  { name: "Jago News", url: "https://www.jagonews24.com/rss/rss.xml" },
  { name: "Prothom Alo", url: "https://www.prothomalo.com/feed/" },
  { name: "RisingBD", url: "https://www.risingbd.com/rss/rss.xml" },
  {
    name: "The Daily Star",
    url: "https://www.thedailystar.net/frontpage/rss.xml",
  },
];

// Helper to extract text from sometimes heavily nested parsed elements
function extractText(value: any): string {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (typeof value === "object") {
    // Handling cases like The Daily Star where title is parsed as { a: [ { _: "Text", $: { href: "..." } } ] }
    if (value.a && Array.isArray(value.a) && value.a.length > 0) {
      if (value.a[0]._) return value.a[0]._;
      if (value.a[0].$ && value.a[0].$.href) return value.a[0].$.href;
    }
    if (value._) return value._;

    try {
      // Very crude fallback so React doesn't crash on objects
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}

export async function GET() {
  try {
    const allNews: NewsItem[] = [];
    const seenLinks = new Set<string>();
    const seenTitles = new Set<string>();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(async (feed) => {
      try {
        // Use native fetch to add custom User-Agent, bypassing some Cloudflare/bot blocks
        const response = await fetch(feed.url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            Accept: "application/rss+xml, application/xml, text/xml, */*",
          },
          // Short timeout so hung feeds don't break the whole request
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const xmlString = await response.text();
        const parsedFeed = await parser.parseString(xmlString);

        parsedFeed.items.forEach((item) => {
          // Try to extract image URL from various standard RSS media fields
          let imageUrl = undefined;

          if (item.enclosure?.url) {
            imageUrl = item.enclosure.url;
          } else if (item.mediaContent?.$?.url) {
            imageUrl = item.mediaContent.$.url;
          } else if (item.mediaThumbnail?.$?.url) {
            imageUrl = item.mediaThumbnail.$.url;
          } else if (item.image?.url) {
            imageUrl = item.image.url;
          } else {
            // Fallback: Try to extract first img src from HTML content (content:encoded or description/content)
            const htmlContent =
              item.contentEncoded || item.content || item.contentSnippet || "";
            // More robust regex for image src extraction
            const imgMatch = htmlContent.match(
              /<img[^>]+src=["']([^"']+)["']/i,
            );
            if (imgMatch && imgMatch[1]) {
              imageUrl = imgMatch[1];
            }
          }

          // If imageUrl is absolutely missing but a link exists, we assign a placeholder using standard google favicon grabber for the News Domain
          if (!imageUrl && item.link) {
            try {
              const urlObj = new URL(item.link);
              imageUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=128`;
            } catch (e) {}
          }

          // Generate favicon URL based on the item link
          let faviconUrl = undefined;
          if (item.link) {
            try {
              const urlObj = new URL(item.link);
              faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
            } catch (e) {}
          }

          let category = extractText(item.category);
          if (!category) {
            category = "General";
          }

          const pubDateStr =
            item.pubDate || item.isoDate || new Date().toISOString();
          const pubDateObj = new Date(pubDateStr);

          // Only allow news from the last 24 hours
          if (!isNaN(pubDateObj.getTime())) {
            // If older than 24 hours, skip
            if (now - pubDateObj.getTime() > ONE_DAY_MS) {
              return;
            }
            // If wildly in the future (timezone bugs), skip
            if (pubDateObj.getTime() - now > ONE_DAY_MS) {
              return;
            }
          }

          const link = extractText(item.link) || "";
          const title = extractText(item.title) || "Untitled";

          // Deduplicate across all sources
          if (link && seenLinks.has(link)) return;
          if (title && title !== "Untitled" && seenTitles.has(title)) return;

          if (link) seenLinks.add(link);
          if (title !== "Untitled") seenTitles.add(title);

          allNews.push({
            id:
              extractText(item.guid) ||
              link ||
              Math.random().toString(36).substring(7),
            title,
            link,
            pubDate: pubDateStr,
            source: feed.name,
            contentSnippet:
              extractText(item.contentSnippet).slice(0, 150) || "",
            imageUrl,
            faviconUrl,
            category,
          });
        });
      } catch (error: any) {
        console.warn(
          `[RSS Info] Failed to fetch feed for ${feed.name}: ${error.message}`,
        );
        // Continue with other feeds even if one fails
      }
    });

    await Promise.allSettled(feedPromises);

    // Process 1: Sort everything strictly chronologically (newest first)
    allNews.sort((a, b) => {
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

    // Process 2: Smart Mix to prevent too many identical adjacent sources
    // We want the newest news first, but we don't want 5 "BD24Live" articles in a row.
    const mixedNews: NewsItem[] = [];
    let lastSource = "";

    while (allNews.length > 0) {
      // Find the first article that is NOT from the last used source
      let nextIndex = allNews.findIndex((item) => item.source !== lastSource);

      // If all remaining articles are from the same source, just take the first one
      if (nextIndex === -1) {
        nextIndex = 0;
      }

      const nextArticle = allNews.splice(nextIndex, 1)[0];
      mixedNews.push(nextArticle);
      lastSource = nextArticle.source;
    }

    // Return the aggregated results
    return NextResponse.json({
      success: true,
      stats: {
        total: mixedNews.length,
        sources: RSS_FEEDS.length,
        lastUpdated: new Date().toISOString(),
      },
      data: mixedNews,
    });
  } catch (error) {
    console.error("RSS Fetching Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news feeds" },
      { status: 500 },
    );
  }
}
