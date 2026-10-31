import { GoogleGenerativeAI } from "@google/generative-ai";
import { EventCreateInput, GeminiPlanOutput, GeminiPlanOutputSchema } from "./schemas";

export const GEMINI_MODEL_ID = process.env.GEMINI_MODEL || "gemini-1.5-flash";
export const GEMINI_MODEL_DISPLAY_NAME = process.env.GEMINI_MODEL_NAME || "Gemini 1.5 Flash";

export interface EventChatContext {
  id: string;
  name: string;
  type: string;
  date: string;
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  preferences?: Record<string, unknown>;
  totalAllocated?: number;
  totalActual?: number;
  budgetRemaining?: number;
}

/**
 * Resolves the Gemini API Key strictly on the server:
 * Checks process.env.GEMINI_API_KEY first, then optional request header.
 */
export function getGeminiApiKey(requestHeaderKey?: string | null): string | null {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0) {
    return process.env.GEMINI_API_KEY.trim();
  }
  if (requestHeaderKey && requestHeaderKey.trim().length > 0) {
    return requestHeaderKey.trim();
  }
  return null;
}

/**
 * Checks if Gemini API key is configured
 */
export function isGeminiKeyConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

/**
 * Cleans markdown code fences from AI response string
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/```$/, "").trim();
  }
  return cleaned;
}

/**
 * Generates an event plan using Gemini model
 */
export async function generateEventPlanWithGemini(
  input: EventCreateInput,
  apiKey: string
): Promise<GeminiPlanOutput> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_ID,
    generationConfig: {
      temperature: 0.35,
      responseMimeType: "application/json",
      maxOutputTokens: 2500,
    },
  });

  const prompt = `You are Planora AI, an elite event planner and budget strategist. Create a comprehensive, realistic event plan based on the inputs below. Return valid JSON matching the exact schema.

Event Parameters:
- Title: "${input.name}"
- Type: ${input.type}
- Scheduled Date: ${input.date}
- Location: ${input.location}
- Expected Guests: ${input.guestCount}
- Total Budget: ${input.currency}${input.totalBudget.toLocaleString()} (${input.currency})
- Theme: ${input.preferences.theme || "Curated aesthetic tailored to " + input.type}
- Vibe / Mood: ${input.preferences.vibe || "Warm, elegant, and seamless"}
- Dietary Notes: ${input.preferences.dietaryNotes || "Standard diverse accommodations"}
- Special Requests: ${input.preferences.specialRequests || "None"}
- Priority Focus: ${input.preferences.priorityFocus}

Planning Strategy Directives:
1. Budget Allocation: Ensure total allocations sum to 90-100% of ${input.totalBudget}. Emphasize the chosen priority focus (${input.preferences.priorityFocus}) with dedicated investment and detail.
2. Timeline Sequencing: Provide chronologically sound milestones leading up to and including ${input.date}, specifying pre_event planning and day_of run-of-show details.
3. Vendors: Recommend realistic vendor archetypes matching typical pricing and standards in ${input.location}.
4. Recommendations: Provide high-impact strategic recommendations covering cost_saving, guest_experience, risk_mitigation, and timing.

Required JSON Schema:
{
  "aiSummary": "A concise, professional 2-paragraph executive overview summarizing the vision, guest experience, and budget strategy.",
  "themeConcept": {
    "title": "Creative Concept Title",
    "colorPalette": ["#Hex1", "#Hex2", "#Hex3", "#Hex4"],
    "description": "Clear styling description of mood, florals, and sensory elements.",
    "decorTips": ["Decor directive 1", "Decor directive 2", "Decor directive 3"]
  },
  "budgetBreakdown": [
    {
      "category": "venue" | "catering" | "decor" | "photography" | "entertainment" | "attire" | "logistics" | "marketing" | "contingency" | "other",
      "name": "Line item name",
      "allocatedAmount": number,
      "notes": "Cost rationale for ${input.guestCount} guests in ${input.location}"
    }
  ],
  "timeline": [
    {
      "title": "Milestone title",
      "targetDate": "YYYY-MM-DD",
      "time": "HH:MM AM/PM or empty",
      "phase": "pre_event" | "day_of" | "post_event",
      "category": "Booking / Logistics / Program",
      "assignedRole": "Planner / Host / Coordinator",
      "description": "Clear action steps"
    }
  ],
  "vendors": [
    {
      "category": "Category name",
      "vendorName": "Suggested vendor profile or archetype in ${input.location}",
      "service": "Core deliverable",
      "estimatedCost": number,
      "aiSuggestionReason": "Why this vendor profile fits this ${input.type} budget"
    }
  ],
  "recommendations": [
    {
      "category": "cost_saving" | "guest_experience" | "risk_mitigation" | "timing",
      "title": "Title",
      "description": "Actionable detail",
      "potentialImpact": "Measurable benefit"
    }
  ]
}

Constraints:
1. Provide 6-8 budget breakdown items covering primary categories.
2. Provide 6-8 chronological timeline milestones covering pre_event and day_of key moments.
3. Provide 4-6 vendor checklist items with estimated pricing.
4. Provide 3-4 high-impact strategic recommendations.
5. Return ONLY valid JSON matching this schema. No markdown backticks.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleaned = cleanJsonString(responseText);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse AI response as JSON: ${errorMsg}. Raw output snippet: ${cleaned.slice(0, 200)}`);
  }

  const validation = GeminiPlanOutputSchema.safeParse(parsedJson);
  if (!validation.success) {
    console.error("Zod Validation Failed on Gemini response:", validation.error);
    throw new Error(
      `Gemini response did not conform to the expected schema: ${validation.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`
    );
  }

  return validation.data;
}

/**
 * Assistant chat response for refining plans
 */
export async function sendAssistantChatMessage(
  message: string,
  eventContext: EventChatContext,
  chatHistory: { sender: string; content: string }[],
  apiKey: string
): Promise<{ reply: string }> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL_ID,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1000,
    },
  });

  const prompt = `You are the Planora AI Event Strategist assistant. Help the user refine their event plan in real-time.

Current Event Context:
- Title: "${eventContext.name}"
- Event Type: ${eventContext.type}
- Scheduled Date: ${eventContext.date}
- Location: ${eventContext.location}
- Guests: ${eventContext.guestCount}
- Total Budget: ${eventContext.currency}${eventContext.totalBudget}
- Total Allocated: ${eventContext.currency}${eventContext.totalAllocated ?? "N/A"}
- Total Actual Spent: ${eventContext.currency}${eventContext.totalActual ?? "N/A"}
- Remaining Budget: ${eventContext.currency}${eventContext.budgetRemaining ?? "N/A"}

Recent Conversation:
${chatHistory.map((m) => `${m.sender.toUpperCase()}: ${m.content}`).join("\n")}

User Request: "${message}"

Respond with concise, actionable advice tailored to their specific event constraints. If recommending budget or timeline adjustments, specify clear numbers. Keep the tone warm, professional, and reassuring.`;

  const result = await model.generateContent(prompt);
  const reply = result.response.text();

  return {
    reply: reply.trim(),
  };
}
