import { z } from "zod";

export const EventTypeSchema = z.enum([
  "wedding",
  "birthday",
  "community",
  "corporate",
  "anniversary",
  "gala",
]);

export const BudgetCategorySchema = z.enum([
  "venue",
  "catering",
  "decor",
  "photography",
  "entertainment",
  "attire",
  "logistics",
  "marketing",
  "contingency",
  "other",
]);

export const BudgetItemStatusSchema = z.enum([
  "planned",
  "deposit_paid",
  "paid_in_full",
  "cancelled",
]);

export const TimelinePhaseSchema = z.enum(["pre_event", "day_of", "post_event"]);

export const MilestoneStatusSchema = z.enum(["pending", "in_progress", "completed"]);

export const VendorStatusSchema = z.enum([
  "not_contacted",
  "inquired",
  "quote_received",
  "negotiating",
  "contract_signed",
  "declined",
]);

export const EventCreateInputSchema = z.object({
  name: z.string().min(2, "Event title must be at least 2 characters").max(100),
  type: EventTypeSchema,
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD")
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  location: z.string().min(2, "Location is required").max(120),
  guestCount: z.number().int().min(1, "Guest count must be at least 1").max(50000),
  totalBudget: z.number().min(100, "Budget must be at least 100").max(10000000),
  currency: z.string().min(1).max(5).default("$"),
  preferences: z
    .object({
      theme: z.string().max(100).optional(),
      vibe: z.string().max(100).optional(),
      dietaryNotes: z.string().max(300).optional(),
      specialRequests: z.string().max(500).optional(),
      priorityFocus: z
        .enum(["venue", "catering", "entertainment", "decor", "balanced"])
        .default("balanced"),
    })
    .default({ priorityFocus: "balanced" }),
});

export type EventCreateInput = z.infer<typeof EventCreateInputSchema>;

export const BudgetItemSchema = z.object({
  id: z.string(),
  category: BudgetCategorySchema,
  name: z.string().min(1).max(100),
  allocatedAmount: z.number().min(0),
  actualAmount: z.number().min(0).default(0),
  status: BudgetItemStatusSchema.default("planned"),
  notes: z.string().optional(),
});

export const TimelineMilestoneSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(120),
  targetDate: z.string(),
  time: z.string().optional(),
  phase: TimelinePhaseSchema,
  category: z.string(),
  status: MilestoneStatusSchema.default("pending"),
  assignedRole: z.string().optional(),
  description: z.string().optional(),
});

export const VendorChecklistItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  vendorName: z.string().min(1),
  service: z.string().min(1),
  estimatedCost: z.number().min(0),
  actualCost: z.number().min(0).optional(),
  status: VendorStatusSchema.default("not_contacted"),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  aiSuggestionReason: z.string().optional(),
});

export const RecommendationSchema = z.object({
  id: z.string(),
  category: z.enum(["cost_saving", "guest_experience", "risk_mitigation", "timing"]),
  title: z.string().min(1),
  description: z.string().min(1),
  potentialImpact: z.string().min(1),
});

// Gemini Structured Output Schema for Plan Generation
export const GeminiPlanOutputSchema = z.object({
  aiSummary: z.string().min(20, "AI summary must be substantive"),
  themeConcept: z.object({
    title: z.string().min(1),
    colorPalette: z.array(z.string()).min(2).max(6),
    description: z.string().min(10),
    decorTips: z.array(z.string()).min(2),
  }),
  budgetBreakdown: z.array(
    z.object({
      category: BudgetCategorySchema,
      name: z.string().min(1),
      allocatedAmount: z.number().min(0),
      notes: z.string().optional(),
    })
  ).min(4),
  timeline: z.array(
    z.object({
      title: z.string().min(1),
      targetDate: z.string(),
      time: z.string().optional(),
      phase: TimelinePhaseSchema,
      category: z.string(),
      assignedRole: z.string().optional(),
      description: z.string().optional(),
    })
  ).min(4),
  vendors: z.array(
    z.object({
      category: z.string(),
      vendorName: z.string(),
      service: z.string(),
      estimatedCost: z.number().min(0),
      aiSuggestionReason: z.string().optional(),
    })
  ).min(3),
  recommendations: z.array(
    z.object({
      category: z.enum(["cost_saving", "guest_experience", "risk_mitigation", "timing"]),
      title: z.string(),
      description: z.string(),
      potentialImpact: z.string(),
    })
  ).min(2),
});

export type GeminiPlanOutput = z.infer<typeof GeminiPlanOutputSchema>;

// Assistant Chat Request Schema
export const AssistantChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  eventContext: z.object({
    id: z.string(),
    name: z.string(),
    type: EventTypeSchema,
    date: z.string(),
    location: z.string(),
    guestCount: z.number(),
    totalBudget: z.number(),
    currency: z.string(),
    preferences: z.record(z.any()).optional(),
    totalAllocated: z.number().optional(),
    totalActual: z.number().optional(),
    budgetRemaining: z.number().optional(),
  }),
  chatHistory: z
    .array(
      z.object({
        sender: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .max(20)
    .optional(),
});
