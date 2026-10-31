"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { getAllEvents, deleteEvent, loadSampleCelebration } from "@/lib/storage";
import { EventPlan } from "@/lib/types";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Card } from "@/ui/Card";
import { PlusCircle, Search, CalendarDays } from "lucide-react";

export default function EventsListingPage() {
  const [events, setEvents] = useState<EventPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date_asc");

  const loadData = useCallback(() => {
    setEvents(getAllEvents());
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener("planora:events-updated", loadData);
    return () => window.removeEventListener("planora:events-updated", loadData);
  }, [loadData]);

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this event?")) {
      deleteEvent(id);
      loadData();
    }
  };

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const matchesSearch =
          event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === "all" || event.type === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "date_asc") {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        } else if (sortBy === "date_desc") {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortBy === "budget_desc") {
          return b.totalBudget - a.totalBudget;
        } else if (sortBy === "budget_asc") {
          return a.totalBudget - b.totalBudget;
        }
        return 0;
      });
  }, [events, searchQuery, selectedType, sortBy]);

  const typeOptions = [
    { value: "all", label: "All Categories" },
    { value: "wedding", label: "Weddings" },
    { value: "birthday", label: "Birthdays" },
    { value: "community", label: "Community Events" },
    { value: "anniversary", label: "Anniversaries" },
    { value: "corporate", label: "Corporate" },
    { value: "gala", label: "Galas" },
  ];

  const sortOptions = [
    { value: "date_asc", label: "Upcoming Date (Soonest)" },
    { value: "date_desc", label: "Date (Furthest Out)" },
    { value: "budget_desc", label: "Budget (Highest First)" },
    { value: "budget_asc", label: "Budget (Lowest First)" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-forest-950">
            Event Portfolio
          </h1>
          <p className="text-sm text-sand-600">
            Manage your curated weddings, milestones, and community celebrations.
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="primary" size="md" className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Plan New Event
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-sand-200/90 shadow-subtle grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Input
            placeholder="Search by title or venue location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          <Search className="w-4 h-4 text-sand-400 absolute left-3 top-3" />
        </div>

        <Select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          options={typeOptions}
        />

        <Select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          options={sortOptions}
        />
      </div>

      {/* Grid of Events */}
      {filteredEvents.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <CalendarDays className="w-8 h-8 text-sand-400 mx-auto" />
          <h3 className="text-lg font-serif font-bold text-forest-950">
            No Celebrations Found
          </h3>
          <p className="text-xs text-sand-500 max-w-sm mx-auto">
            {events.length === 0
              ? "You haven't generated any events yet. Click below to craft your first blueprint."
              : "No events matched your current search filters."}
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/events/new">
              <Button variant="primary" size="sm">
                Create New Event
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                loadSampleCelebration();
                loadData();
              }}
            >
              Load Sample Celebration
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
