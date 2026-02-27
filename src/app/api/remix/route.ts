import { NextResponse } from "next/server";
import { generateRemixContent } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const { headline, content, customPrompt } = await req.json();

    if (!headline || !content) {
      return NextResponse.json(
        { success: false, error: "Headline and content are required" },
        { status: 400 },
      );
    }

    // Pass custom prompt to ai-service if needed, currently it just rewrites
    // In the future: generateRemixContent(headline, content, customPrompt)
    const remixResult = await generateRemixContent(headline, content);

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
