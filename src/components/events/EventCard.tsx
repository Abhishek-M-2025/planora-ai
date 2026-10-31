"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { EventPlan } from "@/lib/types";
import { calculateBudgetSummary, formatCurrency } from "@/lib/budget-calc";
import { getDaysRemaining } from "@/lib/timeline-utils";
import { Card } from "@/ui/Card";
import { Badge } from "@/ui/Badge";
import { ProgressBar } from "@/ui/ProgressBar";
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";

interface EventCardProps {
  event: EventPlan;
  onDelete?: (id: string) => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const summary = useMemo(
    () => calculateBudgetSummary(event.totalBudget, event.budgetItems),
    [event.totalBudget, event.budgetItems]
  );
  const daysInfo = useMemo(() => getDaysRemaining(event.date), [event.date]);
  const completedMilestones = useMemo(
    () => event.timeline.filter((m) => m.status === "completed").length,
    [event.timeline]
  );

  return (
    <Card className="flex flex-col justify-between overflow-hidden group hover:border-forest-700/60 transition-all">
      <div className="p-6 space-y-4">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="forest">
            {event.type}
          </Badge>
          <Badge
            variant={
              daysInfo.isToday
                ? "champagne"
                : daysInfo.isPast
                ? "sand"
                : "terracotta"
            }
          >
            {daysInfo.label}
          </Badge>
        </div>

        {/* Title & Location */}
        <div>
          <Link
            href={`/events/${event.id}`}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded"
          >
            <h3 className="font-serif font-bold text-xl text-forest-950 group-hover:text-forest-800 transition-colors leading-tight">
              {event.name}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-xs text-sand-600 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sand-500" />
              {new Date(event.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-sand-500" />
              {event.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-sand-500" />
              {event.guestCount}
            </span>
          </div>
        </div>

        {/* AI Theme Concept Teaser */}
        {event.themeConcept && (
          <div className="p-3 rounded-lg bg-sand-50 border border-sand-200/70 text-xs text-sand-700">
            <div className="font-semibold text-forest-900 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-champagne-600" />
              {event.themeConcept.title}
            </div>
            <div className="flex items-center gap-1 mt-2">
              {event.themeConcept.colorPalette?.map((c, i) => (
                <span
                  key={i}
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        )}

        {/* Budget Progress */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sand-600 font-medium">Budget Allocated</span>
            <span className="font-bold text-forest-950">
              {formatCurrency(summary.totalAllocated, event.currency)} /{" "}
              {formatCurrency(event.totalBudget, event.currency)}
            </span>
          </div>
          <ProgressBar
            value={summary.totalAllocated}
            max={event.totalBudget}
            variant="forest"
          />
        </div>
      </div>

      {/* Footer bar */}
      <div className="px-6 py-3.5 bg-sand-50/80 border-t border-sand-100 flex items-center justify-between text-xs">
        <span className="text-sand-600 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-sand-400" />
          {completedMilestones}/{event.timeline.length} Milestones
        </span>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              className="p-1 rounded text-sand-400 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`Delete event ${event.name}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 font-semibold text-forest-900 hover:text-forest-700"
          >
            Open Plan
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
