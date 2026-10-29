import { NextResponse } from "next/server";
import { EventCreateInputSchema } from "@/lib/schemas";
import { generateEventPlanWithGemini, getGeminiApiKey, GEMINI_MODEL_ID } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = EventCreateInputSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid event parameters provided",
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const headerKey = req.headers.get("x-gemini-api-key");
    const apiKey = getGeminiApiKey(headerKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "MISSING_API_KEY",
          message:
            "Gemini API key is missing. To generate AI plans, add GEMINI_API_KEY to your .env.local file or provide a key in Planora Settings.",
          instructions:
            "1. Open or create `.env.local` in project root\n2. Add: GEMINI_API_KEY=your_key_here\n3. Restart dev server, or enter your key in the Settings modal.",
        },
        { status: 401 }
      );
    }

    const planOutput = await generateEventPlanWithGemini(validation.data, apiKey);

    return NextResponse.json({
      success: true,
      data: planOutput,
    });
  } catch (error: any) {
    console.error("API error generating plan:", error);

    const errorMessage = error?.message || "An unexpected error occurred during AI plan generation.";
    const isApiKeyInvalid =
      errorMessage.toLowerCase().includes("api_key_invalid") ||
      errorMessage.toLowerCase().includes("api key not valid") ||
      errorMessage.toLowerCase().includes("invalid api key");

    return NextResponse.json(
      {
        error: isApiKeyInvalid ? "INVALID_API_KEY" : "AI_GENERATION_FAILED",
        message: isApiKeyInvalid
          ? "The provided Gemini API key appears to be invalid. Please verify your key in Google AI Studio."
          : `AI Generation failed: ${errorMessage}`,
      },
      { status: isApiKeyInvalid ? 401 : 500 }
    );
  }
}
