"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { getAllEvents, deleteEvent, loadSampleCelebration } from "@/lib/storage";
import { EventPlan } from "@/lib/types";
import { formatCurrency } from "@/lib/budget-calc";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/ui/Button";
import { Card } from "@/ui/Card";
import {
  Sparkles,
  PlusCircle,
  CalendarDays,
  DollarSign,
  CheckCircle2,
  Users,
  Compass,
} from "lucide-react";

export default function DashboardPage() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [modelDisplayName, setModelDisplayName] = useState<string>("Gemini 3.8 Flash");

  const loadData = useCallback(() => {
    const list = getAllEvents();
    setEvents(list);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("planora:events-updated", loadData);
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        if (d.modelDisplayName) setModelDisplayName(d.modelDisplayName);
      })
      .catch(() => {});
    return () => window.removeEventListener("planora:events-updated", loadData);
  }, [loadData]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      deleteEvent(id);
      loadData();
    }
  };

  const handleLoadSample = () => {
    loadSampleCelebration();
    loadData();
  };

  const totalManagedBudget = useMemo(
    () => events.reduce((sum, e) => sum + e.totalBudget, 0),
    [events]
  );
  const totalGuests = useMemo(
    () => events.reduce((sum, e) => sum + e.guestCount, 0),
    [events]
  );
  const totalCompletedMilestones = useMemo(
    () =>
      events.reduce(
        (sum, e) => sum + e.timeline.filter((m) => m.status === "completed").length,
        0
      ),
    [events]
  );

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl bg-forest-950 text-sand-50 p-6 sm:p-10 overflow-hidden shadow-elevated border border-forest-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-900/90 border border-forest-700/80 text-sand-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-champagne-400" />
            Planora AI Studio · {modelDisplayName} Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
            Art-Directed Celebrations, Engineered with Intelligence.
          </h1>
          <p className="text-sand-300 text-sm sm:text-base leading-relaxed">
            From intimate birthday milestones to destination weddings and civic galas—generate structured budgets, date-based timelines, and curated vendor checklists with {modelDisplayName}.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/events/new">
              <Button variant="terracotta" size="lg" className="gap-2 font-semibold shadow-md">
                <PlusCircle className="w-5 h-5" />
                Plan New Celebration
              </Button>
            </Link>
            <Link href="/events">
              <Button
                variant="outline"
                size="lg"
                className="text-sand-200 border-forest-700 hover:bg-forest-900/60 hover:text-white"
              >
                Browse All Plans ({events.length})
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative graphic motif */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden lg:flex items-center justify-center">
          <Compass className="w-96 h-96 text-champagne-400" />
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sand-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Celebrations</span>
            <CalendarDays className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-950">{events.length}</div>
          <p className="text-xs text-sand-500">Saved in browser client storage</p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sand-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Managed Budget Pool</span>
            <DollarSign className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {formatCurrency(totalManagedBudget)}
          </div>
          <p className="text-xs text-sand-500">Across all active plans</p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sand-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Hosted Guests</span>
            <Users className="w-4 h-4 text-forest-700" />
          </div>
          <div className="text-2xl font-serif font-bold text-forest-950">
            {totalGuests.toLocaleString()}
          </div>
          <p className="text-xs text-sand-500">Calculated hospitality capacity</p>
        </Card>

        <Card className="p-5 space-y-1.5">
          <div className="flex items-center justify-between text-sand-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Milestones Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-700">
            {totalCompletedMilestones}
          </div>
          <p className="text-xs text-sand-500">Executed tasks across itineraries</p>
        </Card>
      </div>

      {/* Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold text-forest-950">
              Recent Event Blueprints
            </h2>
            <p className="text-xs text-sand-600">
              Access your personalized budget breakdowns, schedules, and AI consultations.
            </p>
          </div>

          {events.length > 0 && (
            <Link
              href="/events"
              className="text-xs font-semibold text-forest-800 hover:text-forest-950 inline-flex items-center gap-1"
            >
              View all ({events.length}) &rarr;
            </Link>
          )}
        </div>

        {isLoaded && events.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-dashed border-2 border-sand-300">
            <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center mx-auto shadow-subtle">
              <Sparkles className="w-7 h-7 text-champagne-600" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-xl font-serif font-bold text-forest-950">
                No Celebrations Created Yet
              </h3>
              <p className="text-xs text-sand-600 leading-relaxed">
                Start by creating your first wedding, birthday, or community gathering. Planora will call Google Gemini to engineer a custom financial allocation and timeline.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/events/new">
                <Button variant="primary" size="md" className="gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Create New Plan
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="md"
                onClick={handleLoadSample}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4 text-champagne-600" />
                Load Sample Celebration
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 6).map((event) => (
              <EventCard key={event.id} event={event} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
