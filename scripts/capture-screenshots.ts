/**
 * 📸 SocialCard Generator — Automated Screenshot Capture Script
 *
 * This script uses Playwright to automatically navigate through every page
 * of the SocialCard Generator platform, take beautiful full-page and
 * component-level screenshots, and optionally highlight key elements.
 *
 * Usage:
 *   npx playwright test scripts/capture-screenshots.ts
 *   — OR —
 *   npx tsx scripts/capture-screenshots.ts
 *
 * Requirements:
 *   npm install playwright @playwright/test
 *   npx playwright install chromium
 *
 * Configuration:
 *   - Set BASE_URL to your running dev server (default: http://localhost:3000)
 *   - Set LOGIN_EMAIL / LOGIN_PASSWORD for authenticated pages
 *   - Screenshots are saved to ./screenshots/
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

// ─── Configuration ──────────────────────────────────────────────────────────
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN_EMAIL = process.env.LOGIN_EMAIL || "demo@socialcard.com";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "demo1234";
const SCREENSHOT_DIR = path.resolve(__dirname, "..", "screenshots");
const VIEWPORT = { width: 1440, height: 900 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };
const WAIT_AFTER_NAV = 2000; // ms to wait for animations to settle
const WAIT_AFTER_CLICK = 800; // ms to wait after clicking a tab/button

// ─── Highlight Styling ──────────────────────────────────────────────────────
const HIGHLIGHT_CSS = `
  .sc-highlight {
    outline: 3px solid #8b6834 !important;
    outline-offset: 4px !important;
    box-shadow: 0 0 0 6px rgba(139, 104, 52, 0.15) !important;
    position: relative;
    z-index: 9999;
  }
  .sc-highlight::after {
    content: attr(data-sc-label);
    position: absolute;
    top: -28px;
    left: 0;
    background: #8b6834;
    color: white;
    font-size: 11px;
    font-weight: 800;
    padding: 2px 10px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 10000;
    pointer-events: none;
    font-family: system-ui, sans-serif;
  }
`;

// ─── Types ──────────────────────────────────────────────────────────────────
interface ScreenshotTask {
  /** Sub-folder name inside screenshots/ */
  folder: string;
  /** File name (without extension) */
  name: string;
  /** URL path (appended to BASE_URL) */
  path: string;
  /** Whether this page requires authentication */
  auth: boolean;
  /** Full-page screenshot (scroll entire page) */
  fullPage?: boolean;
  /** Selectors to highlight before capturing */
  highlights?: { selector: string; label: string }[];
  /** Actions to perform before the screenshot (click tabs, etc.) */
  actions?: (page: Page) => Promise<void>;
  /** Use mobile viewport */
  mobile?: boolean;
  /** Custom wait time after navigation */
  waitMs?: number;
  /** Scroll to a specific section */
  scrollTo?: string;
}

// ─── Screenshot Plan ────────────────────────────────────────────────────────

const tasks: ScreenshotTask[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // 1. LANDING PAGE
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "01-landing",
    name: "hero-full",
    path: "/",
    auth: false,
    fullPage: false,
    highlights: [
      { selector: "#home h1", label: "Main Headline" },
      { selector: "#home a[href='/dashboard']", label: "CTA Button" },
    ],
  },
  {
    folder: "01-landing",
    name: "hero-mobile",
    path: "/",
    auth: false,
    fullPage: false,
    mobile: true,
  },
  {
    folder: "01-landing",
    name: "how-it-works",
    path: "/",
    auth: false,
    fullPage: false,
    scrollTo: "#how-it-works",
    highlights: [{ selector: "#how-it-works", label: "How It Works" }],
  },
  {
    folder: "01-landing",
    name: "features",
    path: "/",
    auth: false,
    fullPage: false,
    scrollTo: "#features",
    highlights: [{ selector: "#features", label: "Features Section" }],
  },
  {
    folder: "01-landing",
    name: "pricing",
    path: "/",
    auth: false,
    fullPage: false,
    scrollTo: "#pricing",
    highlights: [{ selector: "#pricing", label: "Pricing" }],
  },
  {
    folder: "01-landing",
    name: "about",
    path: "/",
    auth: false,
    fullPage: false,
    scrollTo: "#about",
  },
  {
    folder: "01-landing",
    name: "full-page",
    path: "/",
    auth: false,
    fullPage: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. AUTH PAGES
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "02-auth",
    name: "login-page",
    path: "/auth/login",
    auth: false,
    highlights: [
      { selector: "form", label: "Login Form" },
    ],
  },
  {
    folder: "02-auth",
    name: "signup-page",
    path: "/auth/signup",
    auth: false,
    highlights: [
      { selector: "form", label: "Signup Form" },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "03-dashboard",
    name: "dashboard-overview",
    path: "/dashboard",
    auth: true,
    fullPage: false,
    highlights: [
      { selector: "aside", label: "Sidebar Navigation" },
    ],
  },
  {
    folder: "03-dashboard",
    name: "dashboard-full",
    path: "/dashboard",
    auth: true,
    fullPage: true,
  },
  {
    folder: "03-dashboard",
    name: "dashboard-mobile",
    path: "/dashboard",
    auth: true,
    fullPage: false,
    mobile: true,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. URL NEWSCARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "04-url-newscard",
    name: "editor-default",
    path: "/url",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },
  {
    folder: "04-url-newscard",
    name: "editor-theme-tab",
    path: "/url",
    auth: true,
    fullPage: false,
    waitMs: 3000,
    actions: async (page) => {
      // Click the Theme tab
      await clickTabByText(page, "Theme");
    },
    highlights: [
      { selector: ".grid.grid-cols-2", label: "Theme Gallery" },
    ],
  },
  {
    folder: "04-url-newscard",
    name: "editor-background-tab",
    path: "/url",
    auth: true,
    fullPage: false,
    waitMs: 3000,
    actions: async (page) => {
      await clickTabByText(page, "Background");
    },
  },
  {
    folder: "04-url-newscard",
    name: "editor-fonts-tab",
    path: "/url",
    auth: true,
    fullPage: false,
    waitMs: 3000,
    actions: async (page) => {
      await clickTabByText(page, "Font");
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. NEWS FEED
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "05-news",
    name: "news-feed",
    path: "/news",
    auth: true,
    fullPage: false,
    waitMs: 4000,
  },
  {
    folder: "05-news",
    name: "news-feed-full",
    path: "/news",
    auth: true,
    fullPage: true,
    waitMs: 4000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 6. CUSTOM CARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "06-custom",
    name: "custom-editor",
    path: "/custom",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 7. COMMENT / QUOTE CARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "07-comment",
    name: "comment-editor",
    path: "/comment",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 8. POLL CARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "08-poll",
    name: "poll-editor",
    path: "/poll",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 9. ISLAMIC CARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "09-islamic",
    name: "islamic-editor",
    path: "/islamic",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 10. THUMBNAIL
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "10-thumbnail",
    name: "thumbnail-editor",
    path: "/thumbnail",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 11. VIDEO CARD
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "11-videocard",
    name: "videocard-editor",
    path: "/videocard",
    auth: true,
    fullPage: false,
    waitMs: 3000,
  },
  {
    folder: "11-videocard",
    name: "videocard-background-tab",
    path: "/videocard",
    auth: true,
    fullPage: false,
    waitMs: 3000,
    actions: async (page) => {
      await clickTabByText(page, "Background");
    },
  },
  {
    folder: "11-videocard",
    name: "videocard-branding-tab",
    path: "/videocard",
    auth: true,
    fullPage: false,
    waitMs: 3000,
    actions: async (page) => {
      await clickTabByText(page, "Branding");
    },
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 12. COLLAGE MAKER
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "12-collage",
    name: "collage-maker",
    path: "/collage",
    auth: true,
    fullPage: false,
    waitMs: 2000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 13. BACKGROUND REMOVER
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "13-bg-remover",
    name: "background-remover",
    path: "/background-remover",
    auth: true,
    fullPage: false,
    waitMs: 2000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 14. BANGLA CONVERTER
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "14-bangla-converter",
    name: "bangla-converter",
    path: "/bangla-converter",
    auth: true,
    fullPage: false,
    waitMs: 2000,
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 15. SETTINGS
  // ══════════════════════════════════════════════════════════════════════════
  {
    folder: "15-settings",
    name: "settings-profile",
    path: "/settings",
    auth: true,
    fullPage: false,
    highlights: [
      { selector: "nav", label: "Settings Menu" },
    ],
  },
  {
    folder: "15-settings",
    name: "settings-security",
    path: "/settings",
    auth: true,
    fullPage: false,
    actions: async (page) => {
      await clickTabByText(page, "Security");
    },
  },
  {
    folder: "15-settings",
    name: "settings-plans",
    path: "/settings",
    auth: true,
    fullPage: false,
    actions: async (page) => {
      await clickTabByText(page, "Plan");
    },
  },
  {
    folder: "15-settings",
    name: "settings-developer",
    path: "/settings",
    auth: true,
    fullPage: false,
    actions: async (page) => {
      await clickTabByText(page, "Developer");
    },
  },
  {
    folder: "15-settings",
    name: "settings-integrations",
    path: "/settings",
    auth: true,
    fullPage: false,
    actions: async (page) => {
      await clickTabByText(page, "Integrations");
    },
  },
];

// ─── Toast Notification IDs to Dismiss ──────────────────────────────────────
// These match the `id` values in WhatsNewToast.tsx NOTIFICATIONS array.
// Pre-seeding localStorage with these prevents the toast from rendering.
const WHATS_NEW_IDS = [
  "card-url-banner-v1",
  "card-url-blend-v1",
  "card-comment-portrait-v1",
  "card-comment-quoteframe-v1",
  "update-march-2026",
];

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Dismiss all WhatsNew toast notifications via localStorage */
async function dismissToasts(page: Page) {
  await page.evaluate((ids) => {
    localStorage.setItem("whatsNewDismissed", JSON.stringify(ids));
  }, WHATS_NEW_IDS);
}

/** Click a tab button by partial text match */
async function clickTabByText(page: Page, text: string) {
  try {
    const tab = page.locator(`button:has-text("${text}")`).first();
    if (await tab.isVisible({ timeout: 3000 })) {
      await tab.click();
      await page.waitForTimeout(WAIT_AFTER_CLICK);
    }
  } catch {
    console.log(`  ⚠ Could not find tab: "${text}"`);
  }
}

/** Inject the highlight CSS + add highlight class to elements */
async function applyHighlights(page: Page, highlights: { selector: string; label: string }[]) {
  // Inject highlight CSS
  await page.addStyleTag({ content: HIGHLIGHT_CSS });

  for (const hl of highlights) {
    try {
      await page.evaluate(
        ({ sel, label }) => {
          const el = document.querySelector(sel);
          if (el) {
            el.classList.add("sc-highlight");
            el.setAttribute("data-sc-label", label);
          }
        },
        { sel: hl.selector, label: hl.label }
      );
    } catch {
      console.log(`  ⚠ Could not highlight: "${hl.selector}"`);
    }
  }
}

/** Remove all highlights */
async function removeHighlights(page: Page) {
  await page.evaluate(() => {
    document.querySelectorAll(".sc-highlight").forEach((el) => {
      el.classList.remove("sc-highlight");
      el.removeAttribute("data-sc-label");
    });
  });
}

/** Ensure directory exists */
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/** Login and return authenticated context */
async function login(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  console.log("\n🔐 Logging in...");

  // First, navigate to login page
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Dismiss WhatsNew toasts
  await dismissToasts(page);

  // Fill login form
  await page.fill('#email', LOGIN_EMAIL);
  await page.fill('#password', LOGIN_PASSWORD);

  // Click submit and wait for navigation
  await Promise.all([
    page.waitForNavigation({ timeout: 20000, waitUntil: "networkidle" }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);

  // Wait for app to settle after login
  await page.waitForTimeout(3000);

  // Check if we landed on a page that isn't the login page
  const currentUrl = page.url();
  if (currentUrl.includes("/auth/login")) {
    // Still on login — try checking for an error message
    const errorText = await page.textContent('.bg-\\[\\#f5e5d3\\]').catch(() => null);
    if (errorText) {
      console.log(`  ⚠ Login error: ${errorText.trim()}`);
    }
    console.log("  ⚠ Login might have failed. Still on login page.");
    console.log(`  Current URL: ${currentUrl}`);
    console.log("  ℹ  Tip: Make sure LOGIN_EMAIL and LOGIN_PASSWORD are correct.\n");
  } else {
    console.log(`  ✅ Login successful! Redirected to: ${currentUrl}`);
  }

  // Dismiss toasts one more time after redirect
  await dismissToasts(page);
  await page.close();

  return context;
}

// ─── Main Runner ────────────────────────────────────────────────────────────

async function main() {
  console.log("╔═══════════════════════════════════════════════════════╗");
  console.log("║  📸 SocialCard Generator — Screenshot Capture Tool   ║");
  console.log("╚═══════════════════════════════════════════════════════╝");
  console.log(`\n  Base URL: ${BASE_URL}`);
  console.log(`  Output:   ${SCREENSHOT_DIR}`);
  console.log(`  Tasks:    ${tasks.length} screenshots planned\n`);

  ensureDir(SCREENSHOT_DIR);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  // Create guest context (for non-auth pages)
  const guestContext = await browser.newContext({ viewport: VIEWPORT });

  // Create auth context (for pages requiring login)
  let authContext: BrowserContext | null = null;
  const needsAuth = tasks.some((t) => t.auth);
  if (needsAuth) {
    try {
      authContext = await login(browser);
    } catch (err) {
      console.error("  ❌ Login failed:", err);
      console.log("  ℹ  Continuing with guest screenshots only...\n");
    }
  }

  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const taskNum = `[${i + 1}/${tasks.length}]`;

    // Skip auth tasks if login failed
    if (task.auth && !authContext) {
      console.log(`${taskNum} ⏭ SKIP  ${task.folder}/${task.name} (no auth)`);
      skipCount++;
      continue;
    }

    console.log(`${taskNum} 📷 ${task.folder}/${task.name}`);

    const ctx = task.auth ? authContext! : guestContext;
    let page: Page;

    try {
      // Use mobile viewport if requested
      if (task.mobile) {
        const mobileCtx = task.auth
          ? await browser.newContext({
              viewport: MOBILE_VIEWPORT,
              storageState: await authContext!.storageState(),
              isMobile: true,
            })
          : await browser.newContext({
              viewport: MOBILE_VIEWPORT,
              isMobile: true,
            });
        page = await mobileCtx.newPage();
      } else {
        page = await ctx.newPage();
      }

      // Navigate
      await page.goto(`${BASE_URL}${task.path}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // Dismiss WhatsNew toasts on every page load
      await dismissToasts(page);

      const waitTime = task.waitMs || WAIT_AFTER_NAV;
      await page.waitForTimeout(waitTime);

      // Force-remove any toast elements that might already be rendered
      await page.evaluate(() => {
        // Remove WhatsNewToast container
        const toasts = document.querySelectorAll('.fixed.top-\\[80px\\], .fixed.top-\\[92px\\]');
        toasts.forEach(el => el.remove());
        // Also remove any react-hot-toast containers
        const hotToasts = document.querySelectorAll('[class*="go"][class*="Toaster"]');
        hotToasts.forEach(el => el.remove());
      });

      // Scroll to section if needed
      if (task.scrollTo) {
        await page.evaluate((selector) => {
          const el = document.querySelector(selector);
          if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        }, task.scrollTo);
        await page.waitForTimeout(500);
      }

      // Perform custom actions (click tabs, etc.)
      if (task.actions) {
        await task.actions(page);
      }

      // Apply highlights
      if (task.highlights && task.highlights.length > 0) {
        await applyHighlights(page, task.highlights);
        await page.waitForTimeout(300);
      }

      // Take screenshot
      const folderPath = path.join(SCREENSHOT_DIR, task.folder);
      ensureDir(folderPath);

      const filePath = path.join(folderPath, `${task.name}.png`);
      await page.screenshot({
        path: filePath,
        fullPage: task.fullPage || false,
        type: "png",
      });

      // Get file size for nice output
      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(0);
      console.log(`  ✅ Saved (${sizeKB} KB)`);

      // Clean up highlights
      if (task.highlights) {
        await removeHighlights(page);
      }

      await page.close();
      successCount++;
    } catch (err: any) {
      console.log(`  ❌ Failed: ${err.message}`);
      failCount++;
    }
  }

  // Clean up
  await guestContext.close();
  if (authContext) await authContext.close();
  await browser.close();

  // Summary
  console.log("\n═══════════════════════════════════════════════════════");
  console.log("  📊 Capture Summary");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`  ✅ Captured: ${successCount}`);
  console.log(`  ⏭ Skipped:  ${skipCount}`);
  console.log(`  ❌ Failed:   ${failCount}`);
  console.log(`  📁 Output:   ${SCREENSHOT_DIR}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // List all captured files
  if (successCount > 0) {
    console.log("  📂 Files captured:");
    const folders = fs.readdirSync(SCREENSHOT_DIR).filter((f) =>
      fs.statSync(path.join(SCREENSHOT_DIR, f)).isDirectory()
    );
    for (const folder of folders.sort()) {
      const files = fs.readdirSync(path.join(SCREENSHOT_DIR, folder));
      for (const file of files.sort()) {
        console.log(`     ${folder}/${file}`);
      }
    }
  }
}

main().catch(console.error);
