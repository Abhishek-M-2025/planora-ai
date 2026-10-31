export type EventType =
  | "wedding"
  | "birthday"
  | "community"
  | "corporate"
  | "anniversary"
  | "gala";

export type BudgetCategory =
  | "venue"
  | "catering"
  | "decor"
  | "photography"
  | "entertainment"
  | "attire"
  | "logistics"
  | "marketing"
  | "contingency"
  | "other";

export type BudgetItemStatus =
  | "planned"
  | "deposit_paid"
  | "paid_in_full"
  | "cancelled";

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  allocatedAmount: number;
  actualAmount: number;
  status: BudgetItemStatus;
  notes?: string;
}

export type TimelinePhase = "pre_event" | "day_of" | "post_event";
export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface TimelineMilestone {
  id: string;
  title: string;
  targetDate: string; // ISO date string or specific time
  time?: string;
  phase: TimelinePhase;
  category: string;
  status: MilestoneStatus;
  assignedRole?: string;
  description?: string;
}

export type VendorStatus =
  | "not_contacted"
  | "inquired"
  | "quote_received"
  | "negotiating"
  | "contract_signed"
  | "declined";

export interface VendorChecklistItem {
  id: string;
  category: string;
  vendorName: string;
  service: string;
  estimatedCost: number;
  actualCost?: number;
  status: VendorStatus;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  aiSuggestionReason?: string;
}

export interface Recommendation {
  id: string;
  category: "cost_saving" | "guest_experience" | "risk_mitigation" | "timing";
  title: string;
  description: string;
  potentialImpact: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: "add_budget_item" | "add_milestone" | "add_vendor" | "custom";
    payload?: Record<string, unknown>;
    label?: string;
  };
}

export interface EventPreferences {
  theme?: string;
  vibe?: string;
  dietaryNotes?: string;
  specialRequests?: string;
  priorityFocus?: "venue" | "catering" | "entertainment" | "decor" | "balanced";
}

export interface ThemeConcept {
  title: string;
  colorPalette: string[];
  description: string;
  decorTips: string[];
}

export interface EventPlan {
  id: string;
  name: string;
  type: EventType;
  date: string; // ISO YYYY-MM-DD
  location: string;
  guestCount: number;
  totalBudget: number;
  currency: string;
  preferences: EventPreferences;
  aiSummary: string;
  themeConcept: ThemeConcept;
  budgetItems: BudgetItem[];
  timeline: TimelineMilestone[];
  vendors: VendorChecklistItem[];
  recommendations: Recommendation[];
  chatHistory: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalAllocated: number;
  totalActual: number;
  remainingAllocated: number;
  remainingActual: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  percentageUsed: number;
  categoryBreakdown: {
    category: BudgetCategory;
    allocated: number;
    actual: number;
    percentage: number;
    count: number;
  }[];
}
