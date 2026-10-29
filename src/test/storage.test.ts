import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllEvents,
  saveEvent,
  getEventById,
  updateEvent,
  deleteEvent,
} from "@/lib/storage";
import { EventPlan } from "@/lib/types";

describe("Client Storage Layer", () => {
  const mockPlan: EventPlan = {
    id: "evt_123",
    name: "Summer Solstice Gala",
    type: "gala",
    date: "2027-06-21",
    location: "Seattle, WA",
    guestCount: 200,
    totalBudget: 50000,
    currency: "$",
    preferences: { priorityFocus: "balanced" },
    aiSummary: "A magnificent rooftop charity gala.",
    themeConcept: {
      title: "Golden Hour Glow",
      colorPalette: ["#D4A34B", "#143023"],
      description: "Warm brass and deep forest hues.",
      decorTips: ["Amber uplights"],
    },
    budgetItems: [
      {
        id: "b1",
        category: "venue",
        name: "Skyline Ballroom",
        allocatedAmount: 18000,
        actualAmount: 5000,
        status: "deposit_paid",
      },
    ],
    timeline: [
      {
        id: "t1",
        title: "Guest Check-in",
        targetDate: "2027-06-21",
        phase: "day_of",
        category: "Hospitality",
        status: "pending",
      },
    ],
    vendors: [
      {
        id: "v1",
        category: "Venue",
        vendorName: "Skyline Tower",
        service: "Grand Ballroom",
        estimatedCost: 18000,
        status: "contract_signed",
      },
    ],
    recommendations: [],
    chatHistory: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists and retrieves events cleanly", () => {
    expect(getAllEvents()).toEqual([]);
    saveEvent(mockPlan);

    const events = getAllEvents();
    expect(events.length).toBe(1);
    expect(events[0].id).toBe("evt_123");
    expect(events[0].name).toBe("Summer Solstice Gala");
  });

  it("retrieves a specific event by ID", () => {
    saveEvent(mockPlan);
    const found = getEventById("evt_123");
    expect(found).not.toBeNull();
    expect(found?.location).toBe("Seattle, WA");

    const notFound = getEventById("non_existent");
    expect(notFound).toBeNull();
  });

  it("updates existing events via functional updater", () => {
    saveEvent(mockPlan);

    const updated = updateEvent("evt_123", (prev) => ({
      ...prev,
      guestCount: 250,
      totalBudget: 60000,
    }));

    expect(updated).not.toBeNull();
    expect(updated?.guestCount).toBe(250);

    const reloaded = getEventById("evt_123");
    expect(reloaded?.guestCount).toBe(250);
    expect(reloaded?.totalBudget).toBe(60000);
  });

  it("deletes events by ID", () => {
    saveEvent(mockPlan);
    expect(getAllEvents().length).toBe(1);

    const success = deleteEvent("evt_123");
    expect(success).toBe(true);
    expect(getAllEvents().length).toBe(0);
  });
});
