/**
 * AI Guard — server-side helpers for AI access control and usage tracking.
 * Called from Next.js API routes (not from client code).
 */

import { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface GuardResult {
  ok: boolean;
  userId?: number;
  error?: string;
  status?: number;
}

/**
 * Verifies the Bearer token in the request and checks that:
 * 1. The user is authenticated.
 * 2. The user's AI access is not disabled by an admin.
 */
export async function verifyUserAIAccess(req: NextRequest): Promise<GuardResult> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, error: "Authentication required", status: 401 };
  }

  const token = authHeader.slice(7);

  try {
    // Forward the token to our backend to validate and get user info + ai_enabled flag
    const res = await fetch(`${BACKEND_URL}/auth/ai-check`, {
      headers: { Authorization: `Bearer ${token}` },
      // Short timeout — this is in the request path
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return { ok: false, error: data.message || "Unauthorized", status: res.status };
    }

    if (!data.ai_enabled) {
      return {
        ok: false,
        error: "AI features have been disabled for your account. Please contact support.",
        status: 403,
      };
    }

    return { ok: true, userId: data.userId };
  } catch {
    return { ok: false, error: "Could not verify AI access", status: 500 };
  }
}

/**
 * Increments the AI request counters for a user.
 * Resets the daily counter if the date has changed.
 */
export async function trackAIUsage(userId: number): Promise<void> {
  await fetch(`${BACKEND_URL}/auth/ai-track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
    signal: AbortSignal.timeout(3000),
  });
}
