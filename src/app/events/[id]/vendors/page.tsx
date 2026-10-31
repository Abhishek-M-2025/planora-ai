"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useEventPlan } from "@/lib/use-event-plan";
import { EventHeader } from "@/components/events/EventHeader";
import { VendorChecklist } from "@/components/events/VendorChecklist";
import { EventNotFound } from "@/components/events/EventNotFound";

export default function EventVendorsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { event, setEvent, isLoading } = useEventPlan(id);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sand-500 animate-pulse text-sm">
        Loading vendor directory...
      </div>
    );
  }

  if (!event) {
    return <EventNotFound returnLabel="Return to Portfolio" />;
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <VendorChecklist event={event} onEventUpdated={setEvent} />
    </div>
  );
}
