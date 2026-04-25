import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";
 
export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await request.json();
    const { imageBase64, mimeType = "image/png" } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Strip data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Convert to PNG-compatible file (gpt-image-1 edit works best with PNG)
    const imageFile = new File([buffer], "person-upload.png", {
      type: "image/png",
    });

    const prompt = `This image contains a person. Please:
1. Remove the background completely, leaving only the person with a transparent or clean white background
2. Enhance the image quality — sharpen details, improve lighting and color, make it look like a professional studio portrait
3. Preserve the person's exact facial features, skin tone, hair, clothing, and appearance — do not alter who this person is
4. Output a clean, high-resolution portrait-style image of the person
Keep the person's identity fully intact and recognizable.`;

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      size: "1024x1024",
    });

    const imageData = response.data?.[0];

    if (!imageData) {
      return NextResponse.json({ error: "No image returned from OpenAI" }, { status: 500 });
    }

    // gpt-image-1 returns b64_json directly
    if (imageData.b64_json) {
      return NextResponse.json({
        imageBase64: `data:image/png;base64,${imageData.b64_json}`,
      });
    }

    // Fallback: if URL returned, fetch it and convert to base64
    if (imageData.url) {
      const imgResponse = await fetch(imageData.url);
      const imgBuffer = await imgResponse.arrayBuffer();
      const b64 = Buffer.from(imgBuffer).toString("base64");
      return NextResponse.json({
        imageBase64: `data:image/png;base64,${b64}`,
      });
    }

    return NextResponse.json({ error: "Unexpected response format from OpenAI" }, { status: 500 });

  } catch (error: unknown) {
    console.error("OpenAI image generation error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
