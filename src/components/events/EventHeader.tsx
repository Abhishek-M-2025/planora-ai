"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { EventPlan } from "@/lib/types";
import { getDaysRemaining } from "@/lib/timeline-utils";
import { formatCurrency } from "@/lib/budget-calc";
import { Badge } from "@/ui/Badge";
import { Button } from "@/ui/Button";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  PieChart,
  Clock,
  Briefcase,
  Sparkles,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventHeaderProps {
  event: EventPlan;
}

export function EventHeader({ event }: EventHeaderProps) {
  const pathname = usePathname();
  const daysInfo = getDaysRemaining(event.date);

  const tabs = [
    { label: "Overview", href: `/events/${event.id}`, icon: PieChart },
    { label: "Budget & Expenses", href: `/events/${event.id}/budget`, icon: DollarSign },
    { label: "Timeline & Milestones", href: `/events/${event.id}/timeline`, icon: Clock },
    { label: "Vendor Checklist", href: `/events/${event.id}/vendors`, icon: Briefcase },
    { label: "AI Plan Refiner", href: `/events/${event.id}/assistant`, icon: Sparkles },
  ];

  const eventTypeLabels: Record<string, string> = {
    wedding: "Wedding",
    birthday: "Birthday Milestone",
    community: "Community Celebration",
    corporate: "Corporate Summit",
    anniversary: "Anniversary",
    gala: "Charity Gala",
  };

  return (
    <div className="space-y-6">
      {/* Back link & Top bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-sand-600 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded px-1 py-0.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to all events
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="forest">
            {eventTypeLabels[event.type] || event.type}
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
      </div>

      {/* Main Title & Key Metrics Banner */}
      <div className="p-6 rounded-2xl bg-white border border-sand-200/90 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-forest-950 tracking-tight">
              {event.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-sand-600">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sand-500" />
                {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sand-500" />
                {event.location}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sand-500" />
                {event.guestCount} Guests
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-sand-100">
            <div className="text-right">
              <div className="text-xs uppercase font-semibold tracking-wider text-sand-500">
                Target Budget
              </div>
              <div className="text-xl sm:text-2xl font-serif font-bold text-forest-900">
                {formatCurrency(event.totalBudget, event.currency)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        className="flex space-x-1 border-b border-sand-200 overflow-x-auto pb-px"
        aria-label="Event Sections"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors rounded-t-lg",
                isActive
                  ? "border-forest-900 text-forest-900 bg-sand-100/50"
                  : "border-transparent text-sand-600 hover:text-forest-950 hover:border-sand-300"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "w-4 h-4",
                  isActive ? "text-forest-800" : "text-sand-500"
                )}
                aria-hidden="true"
              />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
