import { NextRequest, NextResponse } from "next/server";
import { generateRemixContent } from "@/lib/ai-service";
import { verifyUserAIAccess, trackAIUsage } from "@/lib/ai-guard";

export async function POST(req: NextRequest) {
  try {
    // Auth + AI-enabled check
    const guard = await verifyUserAIAccess(req);
    if (!guard.ok) {
      return NextResponse.json(
        { success: false, error: guard.error },
        { status: guard.status },
      );
    }

    const { headline, content, customPrompt } = await req.json();

    if (!headline || !content) {
      return NextResponse.json(
        { success: false, error: "Headline and content are required" },
        { status: 400 },
      );
    }

    const remixResult = await generateRemixContent(headline, content);

    // Track usage (fire-and-forget, don't block response)
    trackAIUsage(guard.userId!).catch(() => {});

    return NextResponse.json({
      success: true,
      data: remixResult,
    });
  } catch (error: any) {
    console.error("Remix API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate remix content",
      },
      { status: 500 },
    );
  }
}
