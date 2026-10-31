"use client";

import { useState, useEffect, useCallback } from "react";
import { EventPlan } from "./types";
import { getEventById } from "./storage";

export function useEventPlan(id?: string) {
  const [event, setEvent] = useState<EventPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(() => {
    if (id) {
      const found = getEventById(id);
      setEvent(found);
    } else {
      setEvent(null);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ id?: string }>;
      if (!customEvent.detail?.id || customEvent.detail.id === id) {
        loadData();
      }
    };

    window.addEventListener("planora:events-updated", handleUpdate);
    return () => {
      window.removeEventListener("planora:events-updated", handleUpdate);
    };
  }, [id, loadData]);

  return {
    event,
    setEvent,
    isLoading,
    reload: loadData,
  };
}

