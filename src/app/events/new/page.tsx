"use client";

import React, { useState } from "react";
import { EventForm } from "@/components/events/EventForm";
import { ApiKeyModal } from "@/components/events/ApiKeyModal";

export default function NewEventPage() {
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  return (
    <div>
      <EventForm onOpenApiKeyModal={() => setApiKeyModalOpen(true)} />
      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
      />
    </div>
  );
}
