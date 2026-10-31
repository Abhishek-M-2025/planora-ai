"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEventPlan } from "@/lib/use-event-plan";
import { EventHeader } from "@/components/events/EventHeader";
import { PlanOverview } from "@/components/events/PlanOverview";
import { EventNotFound } from "@/components/events/EventNotFound";

export default function EventOverviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { event, isLoading } = useEventPlan(id);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sand-500 animate-pulse text-sm">
        Loading event blueprint...
      </div>
    );
  }

  if (!event) {
    return <EventNotFound />;
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <PlanOverview event={event} />
    </div>
  );
}
