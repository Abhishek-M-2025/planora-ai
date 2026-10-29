"use client";

import React from "react";
import Link from "next/link";
import { EventPlan } from "@/lib/types";
import { calculateBudgetSummary, formatCurrency, getBudgetWarnings } from "@/lib/budget-calc";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { ProgressBar } from "@/ui/ProgressBar";
import { Badge } from "@/ui/Badge";
import {
  Sparkles,
  Palette,
  DollarSign,
  Clock,
  ArrowRight,
  Lightbulb,
  CheckCircle,
  AlertTriangle,
  Building,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  ShieldAlert,
  FileText,
  Tag,
} from "lucide-react";
import { EventAnalyticsCharts } from "./EventAnalyticsCharts";

interface PlanOverviewProps {
  event: EventPlan;
}

export function PlanOverview({ event }: PlanOverviewProps) {
  const budgetSummary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
  const budgetWarnings = getBudgetWarnings(budgetSummary, event.budgetItems);
  const completedMilestones = event.timeline.filter((t) => t.status === "completed").length;
  const bookedVendors = event.vendors.filter((v) => v.status === "contract_signed").length;

  // Filter recommendations by category
  const riskRecommendations = event.recommendations.filter(
    (r) => r.category === "risk_mitigation"
  );
  const costRecommendations = event.recommendations.filter(
    (r) => r.category === "cost_saving"
  );
  const guestRecommendations = event.recommendations.filter(
    (r) => r.category === "guest_experience" || r.category === "timing"
  );

  return (
    <div className="space-y-8">
      {/* 1. Executive Briefing Header Card */}
      <Card className="border-sand-300 bg-white shadow-card overflow-hidden">
        <div className="border-b border-sand-200/80 bg-sand-50/60 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-forest-900 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-forest-800">
                Planora Strategic Report
              </span>
              <h2 className="text-base font-semibold text-forest-950">
                Executive Synthesis & Event Blueprint
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-forest-100 text-forest-900 font-medium">
              {event.type.toUpperCase()}
            </span>
            <span className="text-sand-500 font-mono">
              {event.guestCount} Guests · {event.location}
            </span>
          </div>
        </div>

        <CardContent className="p-6">
          <p className="text-forest-950/90 leading-relaxed text-sm sm:text-base whitespace-pre-line font-normal">
            {event.aiSummary}
          </p>
        </CardContent>
      </Card>

      {/* 2. Distinct Pastel Section: Budget Overview (Light Blue: #EAF3FF) */}
      <div
        className="rounded-2xl p-6 border border-[#CBE2FE] bg-[#EAF3FF] space-y-5 shadow-sm"
        aria-labelledby="budget-overview-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D5E8FE] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900/70">
                Financial Architecture
              </span>
              <h3 id="budget-overview-heading" className="text-xl font-bold text-blue-950">
                Budget Overview & Resource Allocation
              </h3>
            </div>
          </div>

          <Link
            href={`/events/${event.id}/budget`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-blue-900 font-semibold text-xs border border-blue-200 shadow-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 self-start sm:self-auto"
          >
            <span>Manage Budget Line Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Financial KPI Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/90 rounded-xl p-4 border border-blue-100 shadow-subtle space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-sand-500">
              Total Target Budget
            </span>
            <div className="text-2xl font-bold text-forest-950 font-serif">
              {formatCurrency(event.totalBudget, event.currency)}
            </div>
            <p className="text-[11px] text-sand-500">Authorized event ceiling</p>
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-blue-100 shadow-subtle space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-sand-500">
                Estimated Planned
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-semibold">
                Estimated
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-950 font-serif">
              {formatCurrency(budgetSummary.totalAllocated, event.currency)}
            </div>
            <p className="text-[11px] text-sand-500">
              {event.totalBudget > 0
                ? `${Math.round((budgetSummary.totalAllocated / event.totalBudget) * 100)}% allocated across ${event.budgetItems.length} items`
                : ""}
            </p>
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-blue-100 shadow-subtle space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-sand-500">
                Confirmed Spent
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                Confirmed
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-900 font-serif">
              {formatCurrency(budgetSummary.totalActual, event.currency)}
            </div>
            <p className="text-[11px] text-sand-500">
              {formatCurrency(budgetSummary.remainingActual, event.currency)} unspent cash pool
            </p>
          </div>

          <div className="bg-white/90 rounded-xl p-4 border border-blue-100 shadow-subtle space-y-1">
            <span className="text-xs uppercase font-bold tracking-wider text-sand-500">
              Allocation Buffer
            </span>
            <div
              className={`text-2xl font-bold font-serif ${
                budgetSummary.isOverBudget ? "text-red-600" : "text-forest-900"
              }`}
            >
              {budgetSummary.isOverBudget
                ? `-${formatCurrency(budgetSummary.overBudgetAmount, event.currency)}`
                : formatCurrency(budgetSummary.remainingAllocated, event.currency)}
            </div>
            <p className="text-[11px] text-sand-500">
              {budgetSummary.isOverBudget ? "Allocations exceed budget" : "Unallocated safety reserve"}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white/90 rounded-xl p-4 border border-blue-100 shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-forest-950">
            <span>Overall Budget Allocation Progress</span>
            <span className="font-mono">
              {formatCurrency(budgetSummary.totalAllocated, event.currency)} / {formatCurrency(event.totalBudget, event.currency)}
            </span>
          </div>
          <ProgressBar
            value={budgetSummary.totalAllocated}
            max={event.totalBudget}
            showPercentage
          />
        </div>

        {/* Key Planned Line Items Table Snippet */}
        {event.budgetItems.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-950/70">
              Primary Estimated Allocations
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {event.budgetItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="bg-white/90 p-3.5 rounded-xl border border-blue-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sand-500">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-sm text-forest-950">
                      {formatCurrency(item.allocatedAmount, event.currency)}
                    </span>
                  </div>
                  <h5 className="font-semibold text-xs text-forest-950 leading-snug">
                    {item.name}
                  </h5>
                  {item.notes && (
                    <p className="text-[11px] text-sand-600 line-clamp-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Distinct Pastel Section: Venue & Vendor Recommendations (Light Orange: #FFF0E4) */}
      <div
        className="rounded-2xl p-6 border border-[#FFDEC9] bg-[#FFF0E4] space-y-5 shadow-sm"
        aria-labelledby="vendor-recommendations-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FED2B5] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta-500 text-white flex items-center justify-center shadow-sm">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-800/80">
                Partner Strategy
              </span>
              <h3 id="vendor-recommendations-heading" className="text-xl font-bold text-terracotta-950">
                Venue & Vendor Recommendations
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs bg-white/90 text-terracotta-900 border border-terracotta-200 px-2.5 py-1 rounded-lg font-medium">
              {bookedVendors} of {event.vendors.length} Signed
            </span>
            <Link
              href={`/events/${event.id}/vendors`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-terracotta-900 font-semibold text-xs border border-terracotta-200 shadow-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-700"
            >
              <span>Manage Vendors</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-terracotta-950/80 leading-relaxed">
          AI-curated vendor archetypes and specialty recommendations tailored for {event.location} with explicit estimated pricing. Contact actual vendors directly to obtain confirmed quotes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {event.vendors.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white/90 rounded-xl p-4 border border-terracotta-100 shadow-subtle space-y-2.5 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-terracotta-100 text-terracotta-900 border border-terracotta-200">
                    {vendor.category}
                  </span>
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-forest-950 block">
                      {formatCurrency(vendor.estimatedCost, event.currency)}
                    </span>
                    <span className="text-[10px] text-sand-500 uppercase font-semibold">
                      Estimated Cost
                    </span>
                  </div>
                </div>

                <h4 className="font-semibold text-sm text-forest-950">
                  {vendor.vendorName}
                </h4>
                <p className="text-xs text-forest-900 font-medium">
                  Deliverable: {vendor.service}
                </p>
                {vendor.aiSuggestionReason && (
                  <p className="text-xs text-sand-600 leading-relaxed pt-1 border-t border-sand-100">
                    <span className="font-semibold text-forest-900">Why Selected: </span>
                    {vendor.aiSuggestionReason}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-sand-100 text-[11px] text-sand-500">
                <span>Status: <strong className="capitalize text-forest-900">{vendor.status.replace("_", " ")}</strong></span>
                <span className="text-[10px] bg-sand-100 px-2 py-0.5 rounded text-sand-700 font-medium">
                  Unconfirmed Estimate
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Distinct Pastel Section: Timeline & Milestones (Light Lavender: #F0EBFF) */}
      <div
        className="rounded-2xl p-6 border border-[#E3D7FD] bg-[#F0EBFF] space-y-5 shadow-sm"
        aria-labelledby="timeline-milestones-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8C7FC] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900/80">
                Itinerary & Schedule
              </span>
              <h3 id="timeline-milestones-heading" className="text-xl font-bold text-purple-950">
                Timeline & Execution Milestones
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs bg-white/90 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-medium">
              {completedMilestones} of {event.timeline.length} Milestones Done
            </span>
            <Link
              href={`/events/${event.id}/timeline`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-purple-900 font-semibold text-xs border border-purple-200 shadow-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-700"
            >
              <span>Manage Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <p className="text-xs text-purple-950/80 leading-relaxed">
          Chronological checkpoints organized across your planning phase, day-of operations, and post-event wraps.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {event.timeline.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-white/90 rounded-xl p-4 border border-purple-100 shadow-subtle space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-semibold text-purple-900 bg-purple-100 px-2 py-0.5 rounded font-mono">
                    {item.time ? `${item.targetDate} · ${item.time}` : item.targetDate}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-sand-500 font-bold">
                    {item.phase.replace("_", " ")}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-forest-950 leading-snug">
                  {item.title}
                </h4>
                {item.description && (
                  <p className="text-xs text-sand-600 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-sand-100 flex items-center justify-between text-[11px] text-sand-500">
                <span>Role: <strong className="text-forest-900">{item.assignedRole || "Host"}</strong></span>
                <span className="capitalize font-medium text-purple-900">
                  {item.status.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Distinct Pastel Section: Guest Experience & Event Essentials (Light Green: #E8F4EA) */}
      <div
        className="rounded-2xl p-6 border border-[#C8E7CD] bg-[#E8F4EA] space-y-5 shadow-sm"
        aria-labelledby="guest-experience-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#B8DEC0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800/80">
                Atmosphere & Styling
              </span>
              <h3 id="guest-experience-heading" className="text-xl font-bold text-forest-950">
                Guest Experience & Event Essentials
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-forest-900 bg-white/90 px-3 py-1 rounded-lg border border-forest-200">
            <Users className="w-3.5 h-3.5 text-forest-700" />
            <span>Capacity: <strong>{event.guestCount} Guests</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Aesthetic Concept Card */}
          <div className="bg-white/90 rounded-xl p-5 border border-emerald-100 shadow-subtle space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-base text-forest-950">
                {event.themeConcept.title}
              </h4>
              <p className="text-xs text-sand-600 leading-relaxed">
                {event.themeConcept.description}
              </p>
            </div>

            {/* Color Swatches */}
            <div className="space-y-1.5 pt-2 border-t border-sand-100">
              <span className="text-[11px] uppercase font-bold tracking-wider text-sand-500">
                Curated Color Story
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {event.themeConcept.colorPalette.map((hex, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 p-1 rounded-lg bg-sand-50 border border-sand-200"
                  >
                    <span
                      className="w-5 h-5 rounded-md shadow-xs border border-black/10 shrink-0"
                      style={{ backgroundColor: hex }}
                      aria-label={`Color swatch ${hex}`}
                    />
                    <span className="font-mono text-[11px] text-sand-700 uppercase font-semibold pr-1">
                      {hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decor Tips */}
            {event.themeConcept.decorTips && event.themeConcept.decorTips.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-sand-100">
                <span className="text-[11px] uppercase font-bold tracking-wider text-sand-500">
                  Styling Directives
                </span>
                <ul className="space-y-1 text-xs text-forest-900">
                  {event.themeConcept.decorTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-forest-700 mt-1.5 shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Hospitality Essentials & Preferences */}
          <div className="bg-white/90 rounded-xl p-5 border border-emerald-100 shadow-subtle space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-forest-950 uppercase tracking-wider">
                Event Logistics & Notes
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500">
                    Desired Vibe & Mood
                  </span>
                  <p className="text-forest-950 font-medium">
                    {event.preferences.vibe || "Elegant, warm, and memorable"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500">
                    Dietary & Bar Guidelines
                  </span>
                  <p className="text-forest-950 font-medium">
                    {event.preferences.dietaryNotes || "Standard diverse accommodations"}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-sand-50 border border-sand-200 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sand-500">
                    Special Program Requests
                  </span>
                  <p className="text-forest-950 font-medium">
                    {event.preferences.specialRequests || "No custom requests recorded"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-forest-800 flex items-center justify-between border-t border-sand-100">
              <span>Priority Focus: <strong>{event.preferences.priorityFocus || "Balanced"}</strong></span>
              <span>Target: <strong>{event.guestCount} Attendees</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Distinct Pastel Section: Budget Risks & Warnings (Subtle Amber: #FFFBEB) */}
      <div
        className="rounded-2xl p-6 border border-[#FDE68A] bg-[#FFFBEB] space-y-5 shadow-sm"
        aria-labelledby="budget-risks-heading"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FCE380] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                Risk Management
              </span>
              <h3 id="budget-risks-heading" className="text-xl font-bold text-amber-950">
                Budget Risks, Health & Mitigation Warnings
              </h3>
            </div>
          </div>

          <span
            className={`text-xs px-3 py-1 rounded-lg font-semibold border ${
              budgetSummary.isOverBudget
                ? "bg-red-100 text-red-900 border-red-200"
                : "bg-emerald-100 text-emerald-900 border-emerald-200"
            }`}
          >
            {budgetSummary.isOverBudget ? "Action Required" : "Budget Balanced"}
          </span>
        </div>

        {/* Dynamic Budget Warnings */}
        <div className="space-y-3">
          {budgetWarnings.map((w, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 bg-white/90 ${
                w.type === "danger"
                  ? "border-red-200 text-red-950"
                  : w.type === "warning"
                  ? "border-amber-300 text-amber-950"
                  : "border-blue-200 text-blue-950"
              }`}
            >
              <AlertTriangle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  w.type === "danger"
                    ? "text-red-600"
                    : w.type === "warning"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
              <span className="text-xs font-medium leading-relaxed">{w.message}</span>
            </div>
          ))}

          {/* Strategic Risk Recommendations from Gemini */}
          {riskRecommendations.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-950/80">
                AI Proactive Contingency Measures
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {riskRecommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-white/90 border border-amber-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-xs text-forest-950">{rec.title}</h5>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-medium">
                        Contingency
                      </span>
                    </div>
                    <p className="text-xs text-sand-600 leading-relaxed">{rec.description}</p>
                    <div className="text-[11px] font-semibold text-amber-900 pt-1 border-t border-sand-100">
                      Impact: {rec.potentialImpact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 7. AI Strategic Recommendations Strip */}
      {costRecommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-lg text-forest-950 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-champagne-600" />
              Cost Optimization & High-Impact Opportunities
            </h3>
            <span className="text-xs text-sand-500">Curated by Gemini</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {costRecommendations.map((rec) => (
              <Card key={rec.id} className="p-5 flex flex-col justify-between space-y-3 bg-white border-sand-200">
                <div className="space-y-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200">
                    Cost Saving
                  </span>
                  <h4 className="font-semibold text-sm text-forest-950 leading-snug">
                    {rec.title}
                  </h4>
                  <p className="text-xs text-sand-600 leading-relaxed">
                    {rec.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-sand-100 text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Benefit: {rec.potentialImpact}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 8. Polished Visual Analytics Section (Donut, Comparison Bar, Visual Timeline) */}
      <EventAnalyticsCharts event={event} />

      {/* 9. Quick Action Navigation Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link href={`/events/${event.id}/budget`} className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-forest-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-900 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-forest-950">Track Expenses</h5>
                <p className="text-xs text-sand-500">Edit line items & actuals</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sand-400 group-hover:text-forest-900 transition-colors" />
          </Card>
        </Link>

        <Link href={`/events/${event.id}/timeline`} className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-forest-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-terracotta-100 text-terracotta-800 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-forest-950">Milestone Schedule</h5>
                <p className="text-xs text-sand-500">Manage date phases</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sand-400 group-hover:text-forest-900 transition-colors" />
          </Card>
        </Link>

        <Link href={`/events/${event.id}/assistant`} className="group">
          <Card className="p-4 flex items-center justify-between group-hover:border-forest-800 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-champagne-100 text-champagne-900 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-semibold text-sm text-forest-950">AI Strategist</h5>
                <p className="text-xs text-sand-500">Ask questions & refine</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sand-400 group-hover:text-forest-900 transition-colors" />
          </Card>
        </Link>
      </div>
    </div>
  );
}
