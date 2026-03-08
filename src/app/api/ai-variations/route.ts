import { NextRequest, NextResponse } from "next/server";
import { generateAIVariations } from "@/lib/ai-service";
import { verifyUserAIAccess, trackAIUsage } from "@/lib/ai-guard";

export async function POST(req: NextRequest) {
  // Auth + AI-enabled check
  const guard = await verifyUserAIAccess(req);
  if (!guard.ok) {
    return NextResponse.json(
      { success: false, error: guard.error },
      { status: guard.status },
    );
  }

  try {
    const { title, hashtagLanguage = "Bengali" } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: "title is required" },
        { status: 400 },
      );
    }

    const result = await generateAIVariations(title, hashtagLanguage);

    // Track usage asynchronously
    trackAIUsage(guard.userId!).catch(() => {});

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("AI Variations Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate AI variations" },
      { status: 500 },
    );
  }
}
