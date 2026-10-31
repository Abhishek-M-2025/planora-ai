"use client";

import React, { useState, useMemo } from "react";
import { EventPlan, BudgetCategory } from "@/lib/types";
import { calculateBudgetSummary, formatCurrency, BUDGET_CATEGORIES } from "@/lib/budget-calc";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import {
  PieChart as PieChartIcon,
  BarChart3,
  CalendarDays,
  Clock,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventAnalyticsChartsProps {
  event: EventPlan;
}

// Curated harmonious color palette aligned with Planora's aesthetic
const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  venue: "#1D4732",        // Forest green
  catering: "#C86446",     // Terracotta
  decor: "#7E57C2",        // Lavender / royal violet
  photography: "#2B7BB9",  // Azure / slate blue
  entertainment: "#DCA53D",// Champagne gold
  attire: "#D87093",       // Pale violet red
  logistics: "#4A7C87",    // Deep teal
  marketing: "#E28743",    // Warm amber orange
  contingency: "#B78103",  // Mustard amber
  other: "#6C7A6D",        // Sage slate
};

export function EventAnalyticsCharts({ event }: EventAnalyticsChartsProps) {
  const [hoveredCategory, setHoveredCategory] = useState<BudgetCategory | null>(null);
  const [showTableSummary, setShowTableSummary] = useState(false);

  const summary = useMemo(
    () => calculateBudgetSummary(event.totalBudget, event.budgetItems),
    [event.totalBudget, event.budgetItems]
  );
  const activeCategories = useMemo(
    () => summary.categoryBreakdown.filter((c) => c.allocated > 0),
    [summary.categoryBreakdown]
  );

  // Total allocated from active categories
  const totalAllocated = summary.totalAllocated;

  // Donut chart calculations
  const radius = 80;
  const innerRadius = 52;
  const cx = 110;
  const cy = 110;

  // Build SVG arc paths
  const donutSlices = useMemo(() => {
    let cumulativeAngle = 0;
    return activeCategories.map((cat) => {
      const fraction = totalAllocated > 0 ? cat.allocated / totalAllocated : 0;
      const angle = fraction * 360;
      const startAngle = cumulativeAngle;
      const endAngle = cumulativeAngle + angle;
      cumulativeAngle = endAngle;

      // Convert angles (degrees) to radians, with 0deg at the top (-90deg)
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;

      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);

      const x3 = cx + innerRadius * Math.cos(endRad);
      const y3 = cy + innerRadius * Math.sin(endRad);
      const x4 = cx + innerRadius * Math.cos(startRad);
      const y4 = cy + innerRadius * Math.sin(startRad);

      const largeArc = angle > 180 ? 1 : 0;

      // Path command for donut slice
      const pathData =
        angle >= 359.99
          ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} L ${cx - 0.01} ${cy - innerRadius} A ${innerRadius} ${innerRadius} 0 1 0 ${cx} ${cy - innerRadius} Z`
          : `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

      const categoryDef = BUDGET_CATEGORIES.find((b) => b.id === cat.category);
      const label = categoryDef?.label || cat.category;
      const color = CATEGORY_COLORS[cat.category] || "#6C7A6D";
      const percentage = totalAllocated > 0 ? ((cat.allocated / totalAllocated) * 100).toFixed(1) : "0.0";

      return {
        category: cat.category,
        label,
        color,
        allocated: cat.allocated,
        percentage,
        pathData,
      };
    });
  }, [activeCategories, totalAllocated]);

  // Bar chart highest category for proportional sizing
  const maxCategoryAllocated = useMemo(
    () => Math.max(1, ...activeCategories.map((c) => c.allocated)),
    [activeCategories]
  );

  // Timeline phase grouping
  const preEventMilestones = event.timeline.filter((m) => m.phase === "pre_event");
  const dayOfMilestones = event.timeline.filter((m) => m.phase === "day_of");
  const postEventMilestones = event.timeline.filter((m) => m.phase === "post_event");

  const hoveredSlice = donutSlices.find((s) => s.category === hoveredCategory);

  return (
    <section className="space-y-6 pt-4" aria-labelledby="visual-analytics-heading">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200/90 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-100 text-forest-900 text-[11px] font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
            Planora Visual Analytics
          </div>
          <h3 id="visual-analytics-heading" className="text-xl sm:text-2xl font-serif font-bold text-forest-950">
            Event Blueprint Data & Visual Allocation
          </h3>
          <p className="text-xs text-sand-600">
            Dynamic data-driven spending distribution, category benchmarking, and execution timeline derived from your AI event plan.
          </p>
        </div>

        <button
          onClick={() => setShowTableSummary(!showTableSummary)}
          className="self-start sm:self-auto text-xs font-medium text-forest-800 hover:text-forest-950 bg-sand-100/80 hover:bg-sand-200/70 border border-sand-300/70 px-3 py-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
          aria-expanded={showTableSummary}
        >
          {showTableSummary ? "Hide Accessible Table" : "View Accessible Table"}
        </button>
      </div>

      {/* Accessible Table Summary for Screen Readers / High Contrast */}
      {showTableSummary && (
        <Card className="p-4 bg-sand-50/70 border-sand-300">
          <div className="flex items-center gap-2 mb-2 text-forest-950 font-semibold text-xs uppercase tracking-wider">
            <Info className="w-4 h-4 text-forest-700" />
            Accessible Financial & Milestone Table
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-sand-300 text-sand-600">
                  <th className="py-2 pr-4 font-semibold">Category</th>
                  <th className="py-2 pr-4 font-semibold">Allocated ({event.currency})</th>
                  <th className="py-2 pr-4 font-semibold">Share of Allocated</th>
                  <th className="py-2 font-semibold">Share of Target Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200">
                {activeCategories.map((cat) => {
                  const catDef = BUDGET_CATEGORIES.find((b) => b.id === cat.category);
                  const shareOfAllocated = totalAllocated > 0 ? ((cat.allocated / totalAllocated) * 100).toFixed(1) : "0";
                  const shareOfTotal = event.totalBudget > 0 ? ((cat.allocated / event.totalBudget) * 100).toFixed(1) : "0";
                  return (
                    <tr key={cat.category} className="hover:bg-sand-100/50">
                      <td className="py-2 pr-4 font-medium text-forest-950">{catDef?.label || cat.category}</td>
                      <td className="py-2 pr-4 text-forest-900">{formatCurrency(cat.allocated, event.currency)}</td>
                      <td className="py-2 pr-4 text-sand-600">{shareOfAllocated}%</td>
                      <td className="py-2 text-sand-600">{shareOfTotal}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grid: Charts (Donut + Bar Comparison) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Budget Allocation Donut Chart */}
        <Card className="flex flex-col justify-between border-sand-200/90 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <PieChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-forest-950">Budget Allocation by Category</CardTitle>
                  <p className="text-xs text-sand-500">Interactive percentage breakdown</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono">
                {formatCurrency(totalAllocated, event.currency)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {activeCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-sand-500 space-y-2">
                <PieChartIcon className="w-8 h-8 text-sand-400 mx-auto" />
                <p>No budget allocations recorded yet to plot donut chart.</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* SVG Donut */}
                <div className="relative shrink-0 w-[220px] h-[220px]">
                  <svg
                    viewBox="0 0 220 220"
                    className="w-full h-full drop-shadow-sm select-none"
                    role="img"
                    aria-label={`Donut chart of budget allocation across ${donutSlices.length} categories`}
                  >
                    <title>Budget Allocation Donut Chart</title>
                    {donutSlices.map((slice) => {
                      const isHovered = hoveredCategory === slice.category;
                      return (
                        <path
                          key={slice.category}
                          d={slice.pathData}
                          fill={slice.color}
                          stroke="#FFFFFF"
                          strokeWidth={isHovered ? 2.5 : 1.5}
                          className={cn(
                            "transition-all duration-200 cursor-pointer outline-none",
                            isHovered ? "opacity-100 scale-[1.03] origin-center" : "opacity-95 hover:opacity-100"
                          )}
                          onMouseEnter={() => setHoveredCategory(slice.category)}
                          onMouseLeave={() => setHoveredCategory(null)}
                          onFocus={() => setHoveredCategory(slice.category)}
                          onBlur={() => setHoveredCategory(null)}
                          tabIndex={0}
                          aria-label={`${slice.label}: ${formatCurrency(slice.allocated, event.currency)} (${slice.percentage}%)`}
                        />
                      );
                    })}
                  </svg>

                  {/* Donut Center Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                    {hoveredSlice ? (
                      <>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-sand-500 truncate max-w-[100px]">
                          {hoveredSlice.label}
                        </span>
                        <span className="text-base font-serif font-bold text-forest-950">
                          {hoveredSlice.percentage}%
                        </span>
                        <span className="text-[11px] font-mono font-medium text-forest-900">
                          {formatCurrency(hoveredSlice.allocated, event.currency)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-sand-500">
                          Total Allocated
                        </span>
                        <span className="text-base font-serif font-bold text-forest-950">
                          {formatCurrency(totalAllocated, event.currency)}
                        </span>
                        <span className="text-[10px] text-sand-500">
                          {event.totalBudget > 0
                            ? `${Math.round((totalAllocated / event.totalBudget) * 100)}% of target`
                            : ""}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="flex-1 w-full space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {donutSlices.map((slice) => {
                    const isHovered = hoveredCategory === slice.category;
                    return (
                      <div
                        key={slice.category}
                        onMouseEnter={() => setHoveredCategory(slice.category)}
                        onMouseLeave={() => setHoveredCategory(null)}
                        className={cn(
                          "flex items-center justify-between text-xs py-1 px-2 rounded-lg transition-colors cursor-pointer",
                          isHovered ? "bg-sand-100 font-semibold" : "hover:bg-sand-50"
                        )}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: slice.color }}
                            aria-hidden="true"
                          />
                          <span className="truncate text-forest-950">{slice.label}</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px] shrink-0 text-sand-700">
                          <span>{formatCurrency(slice.allocated, event.currency)}</span>
                          <span className="w-10 text-right text-sand-500">{slice.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Budget Comparison Bar Chart */}
        <Card className="flex flex-col justify-between border-sand-200/90 shadow-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-base text-forest-950">Category Benchmark Comparison</CardTitle>
                  <p className="text-xs text-sand-500">Spending weight across major departments</p>
                </div>
              </div>
              <span className="text-xs text-sand-500">
                {activeCategories.length} Categories
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-2">
            {activeCategories.length === 0 ? (
              <div className="py-12 text-center text-xs text-sand-500 space-y-2">
                <BarChart3 className="w-8 h-8 text-sand-400 mx-auto" />
                <p>No category breakdown available to benchmark.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activeCategories.map((cat) => {
                  const catDef = BUDGET_CATEGORIES.find((b) => b.id === cat.category);
                  const label = catDef?.label || cat.category;
                  const color = CATEGORY_COLORS[cat.category] || "#6C7A6D";
                  const widthPercent = Math.max(4, Math.round((cat.allocated / maxCategoryAllocated) * 100));
                  const shareOfBudget = event.totalBudget > 0
                    ? Math.round((cat.allocated / event.totalBudget) * 100)
                    : 0;

                  return (
                    <div
                      key={cat.category}
                      className="group space-y-1"
                      onMouseEnter={() => setHoveredCategory(cat.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-forest-950 group-hover:text-forest-800 transition-colors">
                          {label}
                        </span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="font-semibold text-forest-900">
                            {formatCurrency(cat.allocated, event.currency)}
                          </span>
                          <span className="text-sand-500">({shareOfBudget}% of budget)</span>
                        </div>
                      </div>

                      {/* Bar Fill Track */}
                      <div className="w-full h-2.5 bg-sand-100 rounded-full overflow-hidden flex">
                        <div
                          className="h-full rounded-full transition-all duration-300 group-hover:brightness-110"
                          style={{
                            width: `${widthPercent}%`,
                            backgroundColor: color,
                          }}
                          role="progressbar"
                          aria-valuenow={cat.allocated}
                          aria-valuemin={0}
                          aria-valuemax={maxCategoryAllocated}
                          aria-label={`${label} budget allocation`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Event Timeline & Milestone Indicator */}
      <Card className="border-sand-200/90 shadow-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <CalendarDays className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base text-forest-950">Visual Milestone Timeline</CardTitle>
                <p className="text-xs text-sand-500">Chronological execution flow across preparation, day-of, and post-event</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-sand-500">Scheduled Event Date:</span>
              <span className="font-semibold text-forest-900 bg-sand-100 px-2 py-0.5 rounded">
                {new Date(event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-2">
          {event.timeline.length === 0 ? (
            <div className="py-10 text-center text-xs text-sand-500 space-y-2">
              <Clock className="w-8 h-8 text-sand-400 mx-auto" />
              <p>No timeline milestones recorded for this celebration.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Phase 1: Pre-Event */}
              {preEventMilestones.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-forest-800" aria-hidden="true" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-forest-900">
                      Phase 1: Pre-Event Milestones ({preEventMilestones.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {preEventMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-[#F0EBFF]/50 border border-[#E3D7FD] space-y-2 hover:bg-[#F0EBFF] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold text-purple-900 bg-purple-100/80 px-2 py-0.5 rounded">
                            {m.targetDate}
                          </span>
                          {m.assignedRole && (
                            <span className="text-sand-600 truncate text-[10px]">
                              Role: {m.assignedRole}
                            </span>
                          )}
                        </div>
                        <h5 className="font-semibold text-sm text-forest-950 leading-snug">
                          {m.title}
                        </h5>
                        {m.description && (
                          <p className="text-xs text-sand-600 line-clamp-2">
                            {m.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 2: Day-Of */}
              {dayOfMilestones.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-sand-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-terracotta-500" aria-hidden="true" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-terracotta-800">
                      Phase 2: Day-Of Celebration Itinerary ({dayOfMilestones.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayOfMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-[#FFF0E4]/60 border border-[#FEDDC7] space-y-2 hover:bg-[#FFF0E4] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold text-terracotta-900 bg-terracotta-100 px-2 py-0.5 rounded">
                            {m.time ? `${m.time}` : m.targetDate}
                          </span>
                          {m.assignedRole && (
                            <span className="text-sand-600 truncate text-[10px]">
                              Lead: {m.assignedRole}
                            </span>
                          )}
                        </div>
                        <h5 className="font-semibold text-sm text-forest-950 leading-snug">
                          {m.title}
                        </h5>
                        {m.description && (
                          <p className="text-xs text-sand-600 line-clamp-2">
                            {m.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase 3: Post-Event */}
              {postEventMilestones.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-sand-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-champagne-600" aria-hidden="true" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-sand-700">
                      Phase 3: Post-Event Wrap & Follow-up ({postEventMilestones.length})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {postEventMilestones.map((m) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl bg-[#E8F4EA]/60 border border-[#CAE8CF] space-y-2 hover:bg-[#E8F4EA] transition-colors"
                      >
                        <div className="flex items-center justify-between gap-1 text-[11px]">
                          <span className="font-semibold text-forest-900 bg-forest-100 px-2 py-0.5 rounded">
                            {m.targetDate}
                          </span>
                          {m.assignedRole && (
                            <span className="text-sand-600 truncate text-[10px]">
                              {m.assignedRole}
                            </span>
                          )}
                        </div>
                        <h5 className="font-semibold text-sm text-forest-950 leading-snug">
                          {m.title}
                        </h5>
                        {m.description && (
                          <p className="text-xs text-sand-600 line-clamp-2">
                            {m.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
