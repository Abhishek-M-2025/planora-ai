import { BudgetItem, BudgetSummary, BudgetCategory } from "./types";

export const BUDGET_CATEGORIES: { id: BudgetCategory; label: string; icon: string }[] = [
  { id: "venue", label: "Venue & Permits", icon: "Building2" },
  { id: "catering", label: "Food & Beverage", icon: "Utensils" },
  { id: "decor", label: "Decor & Floral", icon: "Flower2" },
  { id: "photography", label: "Photo & Video", icon: "Camera" },
  { id: "entertainment", label: "Music & AV", icon: "Music" },
  { id: "attire", label: "Attire & Beauty", icon: "Sparkles" },
  { id: "logistics", label: "Logistics & Rentals", icon: "Truck" },
  { id: "marketing", label: "Stationery & Invites", icon: "Mail" },
  { id: "contingency", label: "Safety Contingency", icon: "ShieldAlert" },
  { id: "other", label: "Miscellaneous", icon: "MoreHorizontal" },
];

/**
 * Calculates budget summary metrics strictly from items and target total budget.
 */
export function calculateBudgetSummary(
  totalBudget: number,
  items: BudgetItem[]
): BudgetSummary {
  const activeItems = items.filter((item) => item.status !== "cancelled");

  const totalAllocated = activeItems.reduce(
    (sum, item) => sum + (Number(item.allocatedAmount) || 0),
    0
  );

  const totalActual = activeItems.reduce(
    (sum, item) => sum + (Number(item.actualAmount) || 0),
    0
  );

  const remainingAllocated = totalBudget - totalAllocated;
  const remainingActual = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget || totalAllocated > totalBudget;
  const overBudgetAmount = isOverBudget
    ? Math.max(0, Math.max(totalActual, totalAllocated) - totalBudget)
    : 0;

  const percentageUsed =
    totalBudget > 0 ? Math.min(100, Math.round((totalActual / totalBudget) * 100)) : 0;

  // Category breakdown
  const categoryMap = new Map<
    BudgetCategory,
    { allocated: number; actual: number; count: number }
  >();

  for (const cat of BUDGET_CATEGORIES) {
    categoryMap.set(cat.id, { allocated: 0, actual: 0, count: 0 });
  }

  for (const item of activeItems) {
    const current = categoryMap.get(item.category) || {
      allocated: 0,
      actual: 0,
      count: 0,
    };
    categoryMap.set(item.category, {
      allocated: current.allocated + (Number(item.allocatedAmount) || 0),
      actual: current.actual + (Number(item.actualAmount) || 0),
      count: current.count + 1,
    });
  }

  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      allocated: data.allocated,
      actual: data.actual,
      percentage: totalBudget > 0 ? (data.allocated / totalBudget) * 100 : 0,
      count: data.count,
    }))
    .filter((c) => c.count > 0 || c.allocated > 0 || c.actual > 0)
    .sort((a, b) => b.allocated - a.allocated);

  return {
    totalBudget,
    totalAllocated,
    totalActual,
    remainingAllocated,
    remainingActual,
    isOverBudget,
    overBudgetAmount,
    percentageUsed,
    categoryBreakdown,
  };
}

/**
 * Format currency amount with commas and symbol
 */
export function formatCurrency(amount: number, symbol: string = "$"): string {
  const num = Number(amount) || 0;
  const isWhole = Number.isInteger(num);
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Generate human-friendly warnings for budget items
 */
export function getBudgetWarnings(
  summary: BudgetSummary,
  items: BudgetItem[]
): { type: "danger" | "warning" | "info"; message: string }[] {
  const warnings: { type: "danger" | "warning" | "info"; message: string }[] = [];

  if (summary.totalActual > summary.totalBudget) {
    warnings.push({
      type: "danger",
      message: `Actual expenditures exceed your total budget by ${formatCurrency(
        summary.totalActual - summary.totalBudget
      )}!`,
    });
  } else if (summary.totalAllocated > summary.totalBudget) {
    warnings.push({
      type: "warning",
      message: `Planned allocations exceed total budget by ${formatCurrency(
        summary.totalAllocated - summary.totalBudget
      )}. Review line items to balance.`,
    });
  }

  // Check individual items where actual exceeds allocated by > 10%
  for (const item of items) {
    if (
      item.status !== "cancelled" &&
      item.allocatedAmount > 0 &&
      item.actualAmount > item.allocatedAmount * 1.1
    ) {
      warnings.push({
        type: "warning",
        message: `"${item.name}" exceeded planned cost by ${formatCurrency(
          item.actualAmount - item.allocatedAmount
        )} (${Math.round(
          ((item.actualAmount - item.allocatedAmount) / item.allocatedAmount) * 100
        )}% over).`,
      });
    }
  }

  if (summary.remainingAllocated > 0 && !summary.isOverBudget) {
    warnings.push({
      type: "info",
      message: `You have ${formatCurrency(
        summary.remainingAllocated
      )} unallocated in your budget pool.`,
    });
  }

  return warnings;
}
