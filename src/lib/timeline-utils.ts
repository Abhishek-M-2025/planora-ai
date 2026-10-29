import { TimelineMilestone, TimelinePhase } from "./types";

export const TIMELINE_PHASES: { id: TimelinePhase; label: string; badge: string }[] = [
  { id: "pre_event", label: "Pre-Event Planning", badge: "bg-forest-100 text-forest-800 border-forest-200" },
  { id: "day_of", label: "Day of Event Schedule", badge: "bg-terracotta-100 text-terracotta-800 border-terracotta-200" },
  { id: "post_event", label: "Post-Event Wrap Up", badge: "bg-champagne-100 text-champagne-800 border-champagne-200" },
];

/**
 * Calculates days remaining from today until eventDate
 */
export function getDaysRemaining(eventDate: string): {
  days: number;
  label: string;
  isPast: boolean;
  isToday: boolean;
} {
  const target = new Date(eventDate);
  const now = new Date();
  // Clear times for pure date comparison
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const diffTime = targetMidnight - nowMidnight;
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return { days: 0, label: "Today!", isPast: false, isToday: true };
  } else if (days > 0) {
    return { days, label: `${days} day${days === 1 ? "" : "s"} to go`, isPast: false, isToday: false };
  } else {
    return { days: Math.abs(days), label: `${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago`, isPast: true, isToday: false };
  }
}

/**
 * Formats date into readable string, handling ISO strings or descriptions
 */
export function formatMilestoneDate(dateStr: string): string {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return dateStr;
}

/**
 * Sorts milestones chronologically (pre_event -> day_of -> post_event, then by targetDate)
 */
export function sortMilestones(milestones: TimelineMilestone[]): TimelineMilestone[] {
  const phaseOrder: Record<TimelinePhase, number> = {
    pre_event: 1,
    day_of: 2,
    post_event: 3,
  };

  return [...milestones].sort((a, b) => {
    if (phaseOrder[a.phase] !== phaseOrder[b.phase]) {
      return phaseOrder[a.phase] - phaseOrder[b.phase];
    }
    const timeA = new Date(a.targetDate).getTime();
    const timeB = new Date(b.targetDate).getTime();
    if (!isNaN(timeA) && !isNaN(timeB)) {
      return timeA - timeB;
    }
    return (a.time || "").localeCompare(b.time || "");
  });
}
