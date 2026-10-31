import { describe, it, expect } from "vitest";
import { getDaysRemaining, formatMilestoneDate, sortMilestones } from "@/lib/timeline-utils";
import { TimelineMilestone } from "@/lib/types";

describe("Timeline Utilities", () => {
  it("calculates accurate days remaining countdowns", () => {
    const today = new Date().toISOString().split("T")[0];
    const todayResult = getDaysRemaining(today);
    expect(todayResult.isToday).toBe(true);
    expect(todayResult.days).toBe(0);

    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const futureResult = getDaysRemaining(futureDate);
    expect(futureResult.isPast).toBe(false);
    expect(futureResult.days).toBe(5);
    expect(futureResult.label).toContain("5 days to go");

    const pastDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const pastResult = getDaysRemaining(pastDate);
    expect(pastResult.isPast).toBe(true);
    expect(pastResult.days).toBe(3);
    expect(pastResult.label).toContain("3 days ago");
  });

  it("formats dates gracefully", () => {
    expect(formatMilestoneDate("2027-06-15")).toContain("2027");
    expect(formatMilestoneDate("")).toBe("");
  });

  it("sorts milestones strictly by phase and chronological order", () => {
    const milestones: TimelineMilestone[] = [
      {
        id: "m_wrap",
        title: "Vendor load-out",
        targetDate: "2027-06-16",
        phase: "post_event",
        category: "Logistics",
        status: "pending",
      },
      {
        id: "m_ceremony",
        title: "Ceremony begins",
        targetDate: "2027-06-15",
        time: "04:00 PM",
        phase: "day_of",
        category: "Run of Show",
        status: "pending",
      },
      {
        id: "m_pre",
        title: "Order invites",
        targetDate: "2027-03-01",
        phase: "pre_event",
        category: "Stationery",
        status: "completed",
      },
    ];

    const sorted = sortMilestones(milestones);
    expect(sorted[0].phase).toBe("pre_event");
    expect(sorted[1].phase).toBe("day_of");
    expect(sorted[2].phase).toBe("post_event");
  });
});

