"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEventPlan } from "@/lib/use-event-plan";
import { EventHeader } from "@/components/events/EventHeader";
import { TimelineManager } from "@/components/events/TimelineManager";
import { EventNotFound } from "@/components/events/EventNotFound";

export default function EventTimelinePage() {
  const params = useParams();
  const id = params?.id as string;
  const { event, setEvent, isLoading } = useEventPlan(id);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sand-500 animate-pulse text-sm">
        Loading milestone schedule...
      </div>
    );
  }

  if (!event) {
    return <EventNotFound returnLabel="Return to Portfolio" />;
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <TimelineManager event={event} onEventUpdated={setEvent} />
    </div>
  );
}
