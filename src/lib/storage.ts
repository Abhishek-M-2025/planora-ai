import { EventPlan } from "./types";

const STORAGE_KEY = "planora_ai_events_v1";

/**
 * Check if running in browser environment
 */
export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Retrieve all saved events from localStorage
 */
export function getAllEvents(): EventPlan[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.error("Failed to parse stored events:", err);
    return [];
  }
}

/**
 * Retrieve a single event by ID
 */
export function getEventById(id: string): EventPlan | null {
  const events = getAllEvents();
  return events.find((e) => e.id === id) || null;
}

/**
 * Save or create an event in localStorage
 */
export function saveEvent(event: EventPlan): void {
  if (!isBrowser()) return;
  const events = getAllEvents();
  const existingIndex = events.findIndex((e) => e.id === event.id);

  const updatedEvent: EventPlan = {
    ...event,
    updatedAt: new Date().toISOString(),
  };

  let newEvents: EventPlan[];
  if (existingIndex >= 0) {
    newEvents = [...events];
    newEvents[existingIndex] = updatedEvent;
  } else {
    newEvents = [updatedEvent, ...events];
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newEvents));
    // Trigger custom event so reactive hooks can update
    window.dispatchEvent(new CustomEvent("planora:events-updated", { detail: { id: event.id } }));
  } catch (err) {
    console.error("Failed to save event to localStorage:", err);
  }
}

/**
 * Update an existing event via functional updater
 */
export function updateEvent(
  id: string,
  updater: (prev: EventPlan) => EventPlan
): EventPlan | null {
  const current = getEventById(id);
  if (!current) return null;
  const updated = updater(current);
  saveEvent(updated);
  return updated;
}

/**
 * Delete an event by ID
 */
export function deleteEvent(id: string): boolean {
  if (!isBrowser()) return false;
  const events = getAllEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return false;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent("planora:events-updated", { detail: { id } }));
    return true;
  } catch (err) {
    console.error("Failed to delete event from localStorage:", err);
    return false;
  }
}

/**
 * Seed a realistic sample celebration for testing and demonstration
 */
export function loadSampleCelebration(): EventPlan {
  const sample: EventPlan = {
    id: `evt_sample_${Date.now()}`,
    name: "Elena & Marcus's Sonoma Vineyard Wedding",
    type: "wedding",
    date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "Sonoma Valley, California",
    guestCount: 135,
    totalBudget: 48000,
    currency: "$",
    preferences: {
      theme: "Sun-drenched Tuscan & Olive Grove",
      vibe: "Warm, candlelit, joyful acoustic elegance",
      priorityFocus: "catering",
      dietaryNotes: "Farm-to-table, biodynamic wine pairings",
      specialRequests: "Sunset vows followed by seven-piece live soul band",
    },
    aiSummary:
      "A magnificent wine country celebration set amidst rolling vineyard hills. The program emphasizes farm-to-table culinary storytelling with biodynamic local pairings, followed by an intimate twilight acoustic session beneath festoon-lit olive canopies.",
    themeConcept: {
      title: "Terracotta Earth & Olive Canopy",
      colorPalette: ["#1B4332", "#C86446", "#E9C46A", "#FAF9F6"],
      description:
        "Rich botanical greens, antique brass candelabras, warm terracotta pottery, and natural cream linen runners.",
      decorTips: [
        "Arrange potted olive topiaries along the aisle rather than single-use cut florals",
        "Incorporate textured linen napkins tied with fresh rosemary and personalized calligraphy placecards",
        "Cluster amber-glass votives at varying heights to create a warm golden glow across dining tables",
      ],
    },
    budgetItems: [
      {
        id: "b1",
        category: "venue",
        name: "Sonoma Vineyard Lawn & Barrel Pavilion",
        allocatedAmount: 16000,
        actualAmount: 16000,
        status: "paid_in_full",
        notes: "Includes exclusive weekend buyout and bridal suite",
      },
      {
        id: "b2",
        category: "catering",
        name: "Four-Course Farm-to-Table Dinner & Artisanal Bar",
        allocatedAmount: 15500,
        actualAmount: 7750,
        status: "deposit_paid",
        notes: "50% contract deposit paid",
      },
      {
        id: "b3",
        category: "photography",
        name: "Documentary Fine-Art Photo & Super 8 Film",
        allocatedAmount: 5200,
        actualAmount: 2600,
        status: "deposit_paid",
      },
      {
        id: "b4",
        category: "entertainment",
        name: "Seven-Piece Soul & Jazz Collective",
        allocatedAmount: 4800,
        actualAmount: 0,
        status: "planned",
      },
      {
        id: "b5",
        category: "decor",
        name: "Bespoke Olive & Floral Installations",
        allocatedAmount: 3800,
        actualAmount: 1900,
        status: "deposit_paid",
      },
      {
        id: "b6",
        category: "contingency",
        name: "Weather & Operational Contingency Reserve",
        allocatedAmount: 2700,
        actualAmount: 0,
        status: "planned",
      },
    ],
    timeline: [
      {
        id: "t1",
        title: "Finalize Vineyard Tasting & Wine Pairing Selection",
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        phase: "pre_event",
        category: "Catering",
        status: "completed",
        assignedRole: "Host & Sommelier",
        description: "Sample seasonal entrees and lock in vintage reserve selections",
      },
      {
        id: "t2",
        title: "Complete Guest RSVP Roster & Dietary Mapping",
        targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        phase: "pre_event",
        category: "Guest Experience",
        status: "in_progress",
        assignedRole: "Lead Planner",
        description: "Consolidate dietary restrictions and confirm final headcounts",
      },
      {
        id: "t3",
        title: "Ceremony Prelude & Acoustic Strings Seated",
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        time: "04:30 PM",
        phase: "day_of",
        category: "Run of Show",
        status: "pending",
        assignedRole: "Band Leader",
        description: "Guests arrive to sparkling wine and live acoustic strings",
      },
      {
        id: "t4",
        title: "Sunset Vows & Ring Exchange",
        targetDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        time: "05:15 PM",
        phase: "day_of",
        category: "Run of Show",
        status: "pending",
        assignedRole: "Officiant",
        description: "Golden hour ceremony overlooking the western vineyard hill",
      },
      {
        id: "t5",
        title: "Rental Load-Out & Security Inspection",
        targetDate: new Date(Date.now() + 121 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        time: "11:00 AM",
        phase: "post_event",
        category: "Logistics",
        status: "pending",
        assignedRole: "Venue Coordinator",
        description: "Ensure all staging and vintage rentals are inventoried",
      },
    ],
    vendors: [
      {
        id: "v1",
        category: "Venue",
        vendorName: "Sonoma Crest Vineyard & Winery",
        service: "Estate Grounds & Barrel Room",
        estimatedCost: 16000,
        actualCost: 16000,
        status: "contract_signed",
        contactEmail: "events@sonomacrest.com",
        contactPhone: "+1 (707) 555-0144",
        notes: "Contract signed, deposit cleared",
      },
      {
        id: "v2",
        category: "Catering",
        vendorName: "Heritage Culinary Atelier",
        service: "Four-Course Seasonal Plated Service",
        estimatedCost: 15500,
        actualCost: 15500,
        status: "contract_signed",
        contactEmail: "info@heritageatelier.com",
        aiSuggestionReason: "Specializes in farm-direct wine country gastronomy",
      },
      {
        id: "v3",
        category: "Photography",
        vendorName: "Loom & Light Fine Art",
        service: "Hybrid Digital and 35mm Photography",
        estimatedCost: 5200,
        status: "quote_received",
        contactPhone: "+1 (707) 555-0192",
      },
      {
        id: "v4",
        category: "Music",
        vendorName: "The West Coast Jazz Trio",
        service: "Ceremony Strings & Twilight Reception",
        estimatedCost: 4800,
        status: "inquired",
      },
    ],
    recommendations: [
      {
        id: "r1",
        category: "cost_saving",
        title: "Estate Winery Direct Purchasing",
        description: "Purchase wines under wholesale allocation with complimentary corkage waiver.",
        potentialImpact: "Saves approximately $1,600 on beverage retail markup",
      },
      {
        id: "r2",
        category: "guest_experience",
        title: "Twilight Shuttles from Healdsburg",
        description: "Charter two sprinter vans to eliminate narrow vineyard road driving for guests.",
        potentialImpact: "Guarantees 100% on-time arrivals and guest safety",
      },
    ],
    chatHistory: [
      {
        id: "m1",
        sender: "assistant",
        content:
          "Welcome! Your Sonoma Vineyard Wedding blueprint is fully mapped with $48,000 allocated across venue, farm-to-table dining, and music. How can I refine your details today?",
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveEvent(sample);
  return sample;
}
