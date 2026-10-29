import { describe, it, expect } from "vitest";
import {
  EventCreateInputSchema,
  GeminiPlanOutputSchema,
  BudgetItemSchema,
  TimelineMilestoneSchema,
} from "@/lib/schemas";

describe("Zod Validation Schemas", () => {
  it("validates legitimate event creation inputs", () => {
    const validWedding = {
      name: "Marcus & Elena's Coastal Wedding",
      type: "wedding",
      date: "2027-06-15",
      location: "Carmel-by-the-Sea, CA",
      guestCount: 120,
      totalBudget: 45000,
      currency: "$",
      preferences: {
        theme: "Mediterranean Coastal",
        vibe: "Warm and romantic",
        priorityFocus: "catering",
      },
    };

    const result = EventCreateInputSchema.safeParse(validWedding);
    expect(result.success).toBe(true);
  });

  it("rejects invalid dates or budget under minimum threshold", () => {
    const invalidBudget = {
      name: "Short Budget Event",
      type: "birthday",
      date: "2027-05-10",
      location: "Austin, TX",
      guestCount: 20,
      totalBudget: 50, // Minimum is 100
      currency: "$",
    };

    const res1 = EventCreateInputSchema.safeParse(invalidBudget);
    expect(res1.success).toBe(false);

    const invalidDate = {
      name: "Invalid Date Event",
      type: "birthday",
      date: "not-a-date",
      location: "Austin, TX",
      guestCount: 20,
      totalBudget: 5000,
      currency: "$",
    };

    const res2 = EventCreateInputSchema.safeParse(invalidDate);
    expect(res2.success).toBe(false);
  });

  it("validates structured Gemini AI plan outputs strictly", () => {
    const validAiOutput = {
      aiSummary:
        "An exquisitely planned Mediterranean celebration balancing coastal gastronomy and intimate acoustic ambiance with strategic financial controls.",
      themeConcept: {
        title: "Azure Olive Terrace",
        colorPalette: ["#1B4332", "#C86446", "#E9C46A", "#FAF9F6"],
        description: "Olive foliage paired with rustic terracotta and warm ivory linen.",
        decorTips: ["Use rosemary sprigs on napkins", "Festoon lighting across the lawn"],
      },
      budgetBreakdown: [
        { category: "venue", name: "Estate Rental", allocatedAmount: 15000 },
        { category: "catering", name: "Farm-to-table Dinner", allocatedAmount: 12000 },
        { category: "photography", name: "Documentary Photo", allocatedAmount: 4000 },
        { category: "entertainment", name: "Acoustic Trio", allocatedAmount: 2500 },
      ],
      timeline: [
        {
          title: "Select Floral Designer",
          targetDate: "2027-02-15",
          phase: "pre_event",
          category: "Design",
        },
        {
          title: "Catering Tasting Menu",
          targetDate: "2027-03-20",
          phase: "pre_event",
          category: "Culinary",
        },
        {
          title: "Ceremony Seating Begins",
          targetDate: "2027-06-15",
          time: "04:30 PM",
          phase: "day_of",
          category: "Run of Show",
        },
        {
          title: "Vendor Load-out Complete",
          targetDate: "2027-06-16",
          phase: "post_event",
          category: "Logistics",
        },
      ],
      vendors: [
        {
          category: "Venue",
          vendorName: "Carmel Valley Estate",
          service: "Event Lawn & Pavilion",
          estimatedCost: 15000,
        },
        {
          category: "Catering",
          vendorName: "Harvest & Vine Co.",
          service: "Organic Plated Dinner",
          estimatedCost: 12000,
        },
        {
          category: "Photography",
          vendorName: "Loom & Light Studios",
          service: "Full Day Coverage",
          estimatedCost: 4000,
        },
      ],
      recommendations: [
        {
          category: "cost_saving",
          title: "BYO Wine with Corkage",
          description: "Source regional vintages directly from local wineries.",
          potentialImpact: "Saves up to $1,800 on bar markups",
        },
        {
          category: "risk_mitigation",
          title: "Ocean Breeze Contingency",
          description: "Reserve outdoor heaters for coastal evening drop.",
          potentialImpact: "Guarantees guest comfort if temperature drops",
        },
      ],
    };

    const validation = GeminiPlanOutputSchema.safeParse(validAiOutput);
    expect(validation.success).toBe(true);
  });
});
