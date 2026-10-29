import { NextResponse } from "next/server";
import { isGeminiKeyConfigured, GEMINI_MODEL_ID, GEMINI_MODEL_DISPLAY_NAME } from "@/lib/gemini";

export async function GET(req: Request) {
  const headerKey = req.headers.get("x-gemini-api-key");
  const hasEnvKey = isGeminiKeyConfigured();
  const hasHeaderKey = Boolean(headerKey && headerKey.trim().length > 0);

  return NextResponse.json({
    status: "ok",
    hasApiKey: hasEnvKey || hasHeaderKey,
    source: hasEnvKey ? "environment" : hasHeaderKey ? "session" : "none",
    model: GEMINI_MODEL_ID,
    modelDisplayName: GEMINI_MODEL_DISPLAY_NAME,
  });
}
