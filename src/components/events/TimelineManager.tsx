"use client";

import React, { useState } from "react";
import { EventPlan, TimelineMilestone, TimelinePhase, MilestoneStatus } from "@/lib/types";
import {
  sortMilestones,
  TIMELINE_PHASES,
  formatMilestoneDate,
} from "@/lib/timeline-utils";
import { updateEvent } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Modal } from "@/ui/Modal";
import { Badge } from "@/ui/Badge";
import {
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Clock3,
  Calendar,
  User,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import confetti from "canvas-confetti";

interface TimelineManagerProps {
  event: EventPlan;
  onEventUpdated: (updated: EventPlan) => void;
}

export function TimelineManager({ event, onEventUpdated }: TimelineManagerProps) {
  const [activePhase, setActivePhase] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TimelineMilestone | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formPhase, setFormPhase] = useState<TimelinePhase>("pre_event");
  const [formCategory, setFormCategory] = useState("Logistics");
  const [formRole, setFormRole] = useState("Host");
  const [formDescription, setFormDescription] = useState("");

  const sorted = sortMilestones(event.timeline);
  const filtered = sorted.filter((m) => (activePhase === "all" ? true : m.phase === activePhase));

  const completedCount = event.timeline.filter((m) => m.status === "completed").length;
  const progressPercent =
    event.timeline.length > 0 ? Math.round((completedCount / event.timeline.length) * 100) : 0;

  const openAddModal = () => {
    setEditingMilestone(null);
    setFormTitle("");
    setFormDate(event.date);
    setFormTime("09:00 AM");
    setFormPhase("pre_event");
    setFormCategory("Planning");
    setFormRole("Host");
    setFormDescription("");
    setIsModalOpen(true);
  };

  const openEditModal = (milestone: TimelineMilestone) => {
    setEditingMilestone(milestone);
    setFormTitle(milestone.title);
    setFormDate(milestone.targetDate);
    setFormTime(milestone.time || "");
    setFormPhase(milestone.phase);
    setFormCategory(milestone.category);
    setFormRole(milestone.assignedRole || "Host");
    setFormDescription(milestone.description || "");
    setIsModalOpen(true);
  };

  const handleToggleStatus = (milestoneId: string) => {
    const nextStatusMap: Record<MilestoneStatus, MilestoneStatus> = {
      pending: "in_progress",
      in_progress: "completed",
      completed: "pending",
    };

    const target = event.timeline.find((m) => m.id === milestoneId);
    if (!target) return;

    const nextStatus = nextStatusMap[target.status];

    if (nextStatus === "completed") {
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch {}
    }

    const updated = updateEvent(event.id, (prev) => ({
      ...prev,
      timeline: prev.timeline.map((m) =>
        m.id === milestoneId ? { ...m, status: nextStatus } : m
      ),
    }));

    if (updated) {
      onEventUpdated(updated);
    }
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const updated = updateEvent(event.id, (prev) => {
      let updatedTimeline: TimelineMilestone[];
      if (editingMilestone) {
        updatedTimeline = prev.timeline.map((m) =>
          m.id === editingMilestone.id
            ? {
                ...m,
                title: formTitle.trim(),
                targetDate: formDate,
                time: formTime.trim(),
                phase: formPhase,
                category: formCategory.trim(),
                assignedRole: formRole.trim(),
                description: formDescription.trim(),
              }
            : m
        );
      } else {
        const newMilestone: TimelineMilestone = {
          id: `tm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          title: formTitle.trim(),
          targetDate: formDate,
          time: formTime.trim(),
          phase: formPhase,
          category: formCategory.trim(),
          status: "pending",
          assignedRole: formRole.trim(),
          description: formDescription.trim(),
        };
        updatedTimeline = [...prev.timeline, newMilestone];
      }
      return {
        ...prev,
        timeline: updatedTimeline,
      };
    });

    if (updated) {
      onEventUpdated(updated);
    }
    setIsModalOpen(false);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (confirm("Remove this milestone from schedule?")) {
      const updated = updateEvent(event.id, (prev) => ({
        ...prev,
        timeline: prev.timeline.filter((m) => m.id !== milestoneId),
      }));
      if (updated) {
        onEventUpdated(updated);
      }
    }
  };

  const phaseOptions = [
    { value: "pre_event", label: "Pre-Event Planning" },
    { value: "day_of", label: "Day of Event Schedule" },
    { value: "post_event", label: "Post-Event Wrap Up" },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Stat Ribbon */}
      <div className="p-5 rounded-2xl bg-white border border-sand-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Timeline Progress: {completedCount} of {event.timeline.length} Milestones Achieved
          </h3>
          <p className="text-xs text-sand-600">
            Click any milestone icon to cycle status: Pending &rarr; In Progress &rarr; Completed.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-32 bg-sand-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-forest-800 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-sm font-bold text-forest-900">{progressPercent}%</span>
          <Button variant="primary" size="sm" onClick={openAddModal} className="gap-1.5 shrink-0 ml-2">
            <Plus className="w-4 h-4" />
            Add Milestone
          </Button>
        </div>
      </div>

      {/* Phase Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActivePhase("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activePhase === "all"
              ? "bg-forest-900 text-sand-50"
              : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
          }`}
        >
          All Milestones ({event.timeline.length})
        </button>

        {TIMELINE_PHASES.map((p) => {
          const count = event.timeline.filter((m) => m.phase === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activePhase === p.id
                  ? "bg-forest-900 text-sand-50"
                  : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
              }`}
            >
              {p.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Timeline List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Clock className="w-8 h-8 text-sand-400 mx-auto" />
          <h4 className="font-serif font-bold text-lg text-forest-950">
            No Milestones in this Phase
          </h4>
          <p className="text-xs text-sand-500 max-w-sm mx-auto">
            Create key deadlines or Day-Of itinerary cues to keep your event team organized.
          </p>
          <Button variant="outline" size="sm" onClick={openAddModal}>
            Add First Milestone
          </Button>
        </Card>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-sand-200/80 before:z-0">
          {filtered.map((milestone) => {
            const isCompleted = milestone.status === "completed";
            const isInProgress = milestone.status === "in_progress";

            const phaseBadge = {
              pre_event: "bg-forest-50 text-forest-900 border-forest-200",
              day_of: "bg-terracotta-50 text-terracotta-900 border-terracotta-200",
              post_event: "bg-champagne-50 text-champagne-900 border-champagne-300",
            }[milestone.phase];

            return (
              <div
                key={milestone.id}
                className="relative z-10 flex items-start gap-4 p-4 rounded-xl bg-white border border-sand-200/90 shadow-subtle hover:shadow-card transition-shadow"
              >
                {/* Status Toggle Button */}
                <button
                  onClick={() => handleToggleStatus(milestone.id)}
                  className="mt-0.5 rounded-full p-1 text-sand-400 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 transition-colors shrink-0"
                  aria-label={`Mark milestone ${milestone.title} as ${
                    isCompleted ? "pending" : isInProgress ? "completed" : "in progress"
                  }`}
                  title="Click to advance status"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-50" />
                  ) : isInProgress ? (
                    <Clock3 className="w-6 h-6 text-amber-500 animate-spin-slow" />
                  ) : (
                    <Circle className="w-6 h-6 text-sand-300 hover:text-sand-500" />
                  )}
                </button>

                {/* Milestone Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base font-semibold leading-snug ${
                          isCompleted
                            ? "line-through text-sand-500"
                            : "text-forest-950"
                        }`}
                      >
                        {milestone.title}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${phaseBadge}`}
                      >
                        {milestone.phase.replace("_", " ")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCompleted
                            ? "success"
                            : isInProgress
                            ? "champagne"
                            : "sand"
                        }
                      >
                        {milestone.status.replace("_", " ")}
                      </Badge>
                      <button
                        onClick={() => openEditModal(milestone)}
                        className="p-1 rounded text-sand-400 hover:text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
                        aria-label={`Edit ${milestone.title}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteMilestone(milestone.id)}
                        className="p-1 rounded text-sand-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        aria-label={`Delete ${milestone.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {milestone.description && (
                    <p className="text-xs text-sand-600 leading-relaxed">
                      {milestone.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-sand-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sand-400" />
                      {formatMilestoneDate(milestone.targetDate)}
                    </span>
                    {milestone.time && (
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-sand-400" />
                        {milestone.time}
                      </span>
                    )}
                    {milestone.assignedRole && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-sand-400" />
                        Role: {milestone.assignedRole}
                      </span>
                    )}
                    <span className="text-[11px] bg-sand-100 px-1.5 py-0.5 rounded text-sand-700">
                      {milestone.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Milestone Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMilestone ? "Edit Timeline Milestone" : "Add Timeline Milestone"}
        description="Establish deadlines, itinerary moments, and team responsibilities."
      >
        <form onSubmit={handleSaveMilestone} className="space-y-4">
          <Input
            label="Milestone Title"
            placeholder="e.g. Finalize Seating Chart & Floral Placement"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Planning Phase"
              value={formPhase}
              onChange={(e) => setFormPhase(e.target.value as TimelinePhase)}
              options={phaseOptions}
            />

            <Input
              label="Category / Workstream"
              placeholder="e.g. Decor & Rentals"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Date"
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              required
            />

            <Input
              label="Target Time / Schedule Slot (Optional)"
              placeholder="e.g. 05:00 PM - Sunset"
              value={formTime}
              onChange={(e) => setFormTime(e.target.value)}
            />
          </div>

          <Input
            label="Lead Assignee / Role"
            placeholder="e.g. Event Coordinator / Host / Caterer"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
          />

          <Input
            label="Instructions & Specific Notes"
            placeholder="e.g. Confirm delivery truck access at side gate by 11:30 AM"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-sand-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingMilestone ? "Save Changes" : "Add Milestone"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
