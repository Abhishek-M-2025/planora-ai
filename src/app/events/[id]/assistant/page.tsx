"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useEventPlan } from "@/lib/use-event-plan";
import { EventHeader } from "@/components/events/EventHeader";
import { PlanRefinerChat } from "@/components/events/PlanRefinerChat";
import { ApiKeyModal } from "@/components/events/ApiKeyModal";
import { EventNotFound } from "@/components/events/EventNotFound";

export default function EventAssistantPage() {
  const params = useParams();
  const id = params?.id as string;
  const { event, setEvent, isLoading } = useEventPlan(id);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sand-500 animate-pulse text-sm">
        Connecting to Planora AI assistant...
      </div>
    );
  }

  if (!event) {
    return <EventNotFound returnLabel="Return to Portfolio" />;
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <PlanRefinerChat
        event={event}
        onEventUpdated={setEvent}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
      />
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
}
