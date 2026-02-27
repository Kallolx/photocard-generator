import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIVariationsResponse {
  headlines: string[];
  summary: string;
  hashtags: string[];
}

export interface AIRemixResponse {
  rewrittenHeadline: string;
  rewrittenContent: string;
  socialMediaTitle: string;
}

export async function generateAIVariations(
  currentTitle: string,
  hashtagLanguage: "English" | "Bengali" = "Bengali",
): Promise<AIVariationsResponse> {
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured in .env.local");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze the following headline: "${currentTitle}"
    
    Provide the following:
    1. Three alternative headlines in the SAME LANGUAGE as the input headline. CRITICAL: Do NOT include any emojis in these headlines.
    2. A professional, detailed, and engaging social media summary (max 250 characters). THIS SUMMARY MUST BE IN THE SAME LANGUAGE AS THE INPUT HEADLINE (e.g., if input is Bengali, summary must be Bengali).
    3. Ten relevant hashtags. These hashtags must be in ${hashtagLanguage} regardless of the input headline language.

    Return the response strictly as a JSON object with this structure:
    {
      "headlines": ["choice 1", "choice 2", "choice 3"],
      "summary": "your detailed summary here",
      "hashtags": ["#tag1", "#tag2", ...]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown code blocks from the response
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString) as AIVariationsResponse;
  } catch (error) {
    console.error("Gemini AI request failed:", error);
    throw new Error(
      "Failed to generate AI variations. Please check your API key and connection.",
    );
  }
}

export async function generateRemixContent(
  headline: string,
  content: string,
): Promise<AIRemixResponse> {
  if (!API_KEY || API_KEY === "your_gemini_api_key_here") {
    throw new Error("Gemini API key is not configured in .env.local");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Analyze the following news article:
    Headline: "${headline}"
    Content: "${content}"
    
    Provide the following to "remix" this article:
    1. A single, engaging rewritten headline that accurately reflects the original but is catchier. Must be in the SAME LANGUAGE as the input headline. CRITICAL: NO EMOJIS.
    2. A rewritten version of the ENTIRE main content. It must summarize or rewrite the full details but be NO LONGER THAN 500 WORDS. Must be in the SAME LANGUAGE. CRITICAL: NO EMOJIS.
    3. A specific, highly engaging "Social Media Ready" title designed to drive clicks. CRITICAL: NO EMOJIS.

    Return the response strictly as a JSON object with this structure:
    {
      "rewrittenHeadline": "your rewritten headline here",
      "rewrittenContent": "your rewritten content here",
      "socialMediaTitle": "your social media ready title here"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString) as AIRemixResponse;
  } catch (error) {
    console.error("Gemini AI remix failed:", error);
    throw new Error(
      "Failed to generate AI remix. Please check your API key and connection.",
    );
  }
}
