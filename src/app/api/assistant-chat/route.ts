import { NextResponse } from "next/server";
import { AssistantChatRequestSchema } from "@/lib/schemas";
import { getGeminiApiKey, sendAssistantChatMessage } from "@/lib/gemini";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const validation = AssistantChatRequestSchema.safeParse(rawBody);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Invalid chat payload",
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
            "Gemini API key is required to use the Planora AI Assistant. Please configure GEMINI_API_KEY in `.env.local` or Settings.",
        },
        { status: 401 }
      );
    }

    const { message, eventContext, chatHistory = [] } = validation.data;
    const response = await sendAssistantChatMessage(message, eventContext, chatHistory, apiKey);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error: any) {
    console.error("Assistant chat error:", error);
    return NextResponse.json(
      {
        error: "ASSISTANT_ERROR",
        message: error?.message || "Failed to process message with AI assistant.",
      },
      { status: 500 }
    );
  }
}
