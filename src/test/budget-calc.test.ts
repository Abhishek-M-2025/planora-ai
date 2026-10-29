import { describe, it, expect } from "vitest";
import {
  calculateBudgetSummary,
  formatCurrency,
  getBudgetWarnings,
} from "@/lib/budget-calc";
import { BudgetItem } from "@/lib/types";

describe("Budget Calculation Engine", () => {
  const sampleItems: BudgetItem[] = [
    {
      id: "1",
      category: "venue",
      name: "Chateau Rental",
      allocatedAmount: 10000,
      actualAmount: 9500,
      status: "deposit_paid",
    },
    {
      id: "2",
      category: "catering",
      name: "Dinner & Wine",
      allocatedAmount: 8000,
      actualAmount: 8500,
      status: "planned",
    },
    {
      id: "3",
      category: "photography",
      name: "Photo & Drone",
      allocatedAmount: 4000,
      actualAmount: 4000,
      status: "paid_in_full",
    },
    {
      id: "4",
      category: "decor",
      name: "Floral Arches (Cancelled)",
      allocatedAmount: 3000,
      actualAmount: 0,
      status: "cancelled", // should be omitted
    },
  ];

  it("calculates accurate total allocated and actual amounts excluding cancelled items", () => {
    const summary = calculateBudgetSummary(25000, sampleItems);

    expect(summary.totalBudget).toBe(25000);
    expect(summary.totalAllocated).toBe(22000); // 10000 + 8000 + 4000
    expect(summary.totalActual).toBe(22000); // 9500 + 8500 + 4000
    expect(summary.remainingAllocated).toBe(3000);
    expect(summary.remainingActual).toBe(3000);
    expect(summary.isOverBudget).toBe(false);
    expect(summary.overBudgetAmount).toBe(0);
    expect(summary.percentageUsed).toBe(88);
  });

  it("detects over-budget conditions when actual exceeds total budget", () => {
    const overItems: BudgetItem[] = [
      {
        id: "1",
        category: "venue",
        name: "Luxury Estate",
        allocatedAmount: 20000,
        actualAmount: 26000,
        status: "paid_in_full",
      },
    ];

    const summary = calculateBudgetSummary(20000, overItems);

    expect(summary.isOverBudget).toBe(true);
    expect(summary.overBudgetAmount).toBe(6000);
    expect(summary.remainingActual).toBe(-6000);
  });

  it("produces correct category breakdown aggregation", () => {
    const summary = calculateBudgetSummary(30000, sampleItems);

    const venue = summary.categoryBreakdown.find((c) => c.category === "venue");
    expect(venue).toBeDefined();
    expect(venue?.allocated).toBe(10000);
    expect(venue?.actual).toBe(9500);
    expect(venue?.count).toBe(1);

    const decor = summary.categoryBreakdown.find((c) => c.category === "decor");
    // Cancelled item should not contribute
    expect(decor).toBeUndefined();
  });

  it("formats currency cleanly with custom symbols", () => {
    expect(formatCurrency(12500)).toBe("$12,500");
    expect(formatCurrency(450.5, "€")).toBe("€450.50");
    expect(formatCurrency(0, "£")).toBe("£0");
  });

  it("generates warning heuristics for overruns and unallocated funds", () => {
    const summary = calculateBudgetSummary(25000, sampleItems);
    const warnings = getBudgetWarnings(summary, sampleItems);

    // Should note unallocated $3,000
    const infoWarning = warnings.find((w) => w.type === "info");
    expect(infoWarning).toBeDefined();
    expect(infoWarning?.message).toContain("unallocated");

    // Over budget test
    const overSummary = calculateBudgetSummary(15000, sampleItems);
    const overWarnings = getBudgetWarnings(overSummary, sampleItems);
    const danger = overWarnings.find((w) => w.type === "danger");
    expect(danger).toBeDefined();
    expect(danger?.message).toContain("exceed your total budget");
  });
});
