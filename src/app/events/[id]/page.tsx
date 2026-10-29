"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getEventById } from "@/lib/storage";
import { EventPlan } from "@/lib/types";
import { EventHeader } from "@/components/events/EventHeader";
import { PlanOverview } from "@/components/events/PlanOverview";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function EventOverviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const [event, setEvent] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    if (id) {
      const found = getEventById(id);
      setEvent(found);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener("planora:events-updated", loadData);
    return () => window.removeEventListener("planora:events-updated", loadData);
  }, [id]);

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sand-500 animate-pulse text-sm">
        Loading event blueprint...
      </div>
    );
  }

  if (!event) {
    return (
      <Card className="p-12 text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-serif font-bold text-forest-950">
          Celebration Not Found
        </h2>
        <p className="text-xs text-sand-600">
          This event could not be located in your browser storage. It may have been deleted or created in a different browser session.
        </p>
        <Link href="/events">
          <Button variant="primary" size="sm">
            Return to Event Portfolio
          </Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <EventHeader event={event} />
      <PlanOverview event={event} />
    </div>
  );
}
