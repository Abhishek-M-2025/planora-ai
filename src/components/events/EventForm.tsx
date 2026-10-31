"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EventCreateInput, EventCreateInputSchema, GeminiPlanOutput } from "@/lib/schemas";
import { EventPlan, EventType, BudgetItem, TimelineMilestone, VendorChecklistItem } from "@/lib/types";
import { saveEvent } from "@/lib/storage";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/ui/Card";
import { Alert } from "@/ui/Alert";
import { Sparkles, Key, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";

interface EventFormProps {
  onOpenApiKeyModal?: () => void;
}

export function EventForm({ onOpenApiKeyModal }: EventFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [modelDisplayName, setModelDisplayName] = useState<string>("Gemini 3.8 Flash");
  const [errorMessage, setErrorMessage] = useState<{
    title: string;
    description: string;
    isApiKeyError?: boolean;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => {
        if (d.modelDisplayName) setModelDisplayName(d.modelDisplayName);
      })
      .catch(() => {});
  }, []);

  // Form states with realistic default placeholders
  const [formData, setFormData] = useState<EventCreateInput>({
    name: "",
    type: "wedding",
    date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "",
    guestCount: 100,
    totalBudget: 25000,
    currency: "$",
    preferences: {
      theme: "",
      vibe: "",
      dietaryNotes: "",
      specialRequests: "",
      priorityFocus: "balanced",
    },
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const eventTypeOptions = [
    { value: "wedding", label: "Wedding Celebration" },
    { value: "birthday", label: "Birthday Milestone" },
    { value: "community", label: "Community Gathering / Festival" },
    { value: "anniversary", label: "Anniversary Celebration" },
    { value: "corporate", label: "Corporate Retreat / Summit" },
    { value: "gala", label: "Charity Gala / Fundraiser" },
  ];

  const priorityOptions = [
    { value: "balanced", label: "Balanced Allocation across all facets" },
    { value: "venue", label: "Venue & Atmosphere Priority" },
    { value: "catering", label: "Culinary & Beverage Experience Priority" },
    { value: "entertainment", label: "Live Music & Entertainment Priority" },
    { value: "decor", label: "Floral, Lighting & Decor Artistry Priority" },
  ];

  const currencyOptions = [
    { value: "$", label: "$ (USD / CAD / AUD)" },
    { value: "€", label: "€ (EUR)" },
    { value: "£", label: "£ (GBP)" },
    { value: "₹", label: "₹ (INR)" },
    { value: "¥", label: "¥ (JPY)" },
  ];

  const handleInputChange = <K extends keyof EventCreateInput>(
    field: K,
    value: EventCreateInput[K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePreferenceChange = (
    field: keyof NonNullable<EventCreateInput["preferences"]>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFormErrors({});

    // Client-side schema validation
    const validation = EventCreateInputSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of validation.error.errors) {
        fieldErrors[err.path.join(".")] = err.message;
      }
      setFormErrors(fieldErrors);
      setErrorMessage({
        title: "Please complete all required fields",
        description: "Review the highlighted inputs below before generating your plan.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const sessionKey = typeof window !== "undefined" ? sessionStorage.getItem("planora_session_gemini_key") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionKey) {
        headers["x-gemini-api-key"] = sessionKey;
      }

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers,
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "MISSING_API_KEY") {
          setErrorMessage({
            title: "Gemini API Key Required",
            description:
              data.message ||
              "Please configure your GEMINI_API_KEY in `.env.local` or enter one in the API settings modal to generate live AI plans.",
            isApiKeyError: true,
          });
        } else if (data.error === "INVALID_API_KEY") {
          setErrorMessage({
            title: "Invalid Gemini API Key",
            description:
              "The configured API key was rejected by Google Gemini. Please check your credentials in Google AI Studio.",
            isApiKeyError: true,
          });
        } else {
          setErrorMessage({
            title: "Plan Generation Failed",
            description: data.message || "An unexpected error occurred during synthesis. Please try again.",
          });
        }
        setIsLoading(false);
        return;
      }

      // Convert Gemini output to our persisted EventPlan
      const generated: GeminiPlanOutput = data.data;
      const eventId = `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const budgetItems: BudgetItem[] = generated.budgetBreakdown.map((item, idx) => ({
        id: `bi_${Date.now()}_${idx}`,
        category: item.category,
        name: item.name,
        allocatedAmount: Number(item.allocatedAmount) || 0,
        actualAmount: 0,
        status: "planned",
        notes: item.notes || "",
      }));

      const timeline: TimelineMilestone[] = generated.timeline.map((item, idx) => ({
        id: `tm_${Date.now()}_${idx}`,
        title: item.title,
        targetDate: item.targetDate || formData.date,
        time: item.time || "",
        phase: item.phase || "pre_event",
        category: item.category || "Planning",
        status: "pending",
        assignedRole: item.assignedRole || "Host",
        description: item.description || "",
      }));

      const vendors: VendorChecklistItem[] = generated.vendors.map((item, idx) => ({
        id: `vnd_${Date.now()}_${idx}`,
        category: item.category,
        vendorName: item.vendorName,
        service: item.service,
        estimatedCost: Number(item.estimatedCost) || 0,
        status: "not_contacted",
        aiSuggestionReason: item.aiSuggestionReason || "",
      }));

      const newPlan: EventPlan = {
        id: eventId,
        name: formData.name,
        type: formData.type,
        date: formData.date,
        location: formData.location,
        guestCount: formData.guestCount,
        totalBudget: formData.totalBudget,
        currency: formData.currency,
        preferences: formData.preferences,
        aiSummary: generated.aiSummary,
        themeConcept: generated.themeConcept,
        budgetItems,
        timeline,
        vendors,
        recommendations: generated.recommendations.map((rec, idx) => ({
          id: `rec_${Date.now()}_${idx}`,
          category: rec.category,
          title: rec.title,
          description: rec.description,
          potentialImpact: rec.potentialImpact,
        })),
        chatHistory: [
          {
            id: `msg_init`,
            sender: "assistant",
            content: `Welcome! I've created the tailored blueprint for "${formData.name}". You can inspect your allocated budget, chronological milestones, and recommended vendors. Let me know if you'd like to adjust costs or tweak any details.`,
            timestamp: new Date().toISOString(),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Persist in localStorage
      saveEvent(newPlan);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#144832", "#C86446", "#DCA53D", "#FAF9F6"],
        });
      } catch {}

      // Navigate to event dashboard
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      console.error("Client submission error:", err);
      setErrorMessage({
        title: "Connection Error",
        description: err.message || "Failed to reach Planora server API. Check your connection.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner Heading */}
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-100 border border-forest-200 text-forest-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
          AI Event Architect
        </div>
        <h1 className="text-3xl font-serif font-bold text-forest-950">
          Create & Synthesize Your Event
        </h1>
        <p className="text-sm text-sand-600 max-w-2xl">
          Enter your celebration specifications. Planora will invoke Google {modelDisplayName} to engineer a custom budget, chronological timeline, vendor checklist, and creative concept.
        </p>
      </div>

      {errorMessage && (
        <Alert variant={errorMessage.isApiKeyError ? "warning" : "danger"} title={errorMessage.title}>
          <div className="space-y-2">
            <p>{errorMessage.description}</p>
            {errorMessage.isApiKeyError && onOpenApiKeyModal && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 text-xs gap-1.5 bg-white"
                onClick={onOpenApiKeyModal}
              >
                <Key className="w-3.5 h-3.5" />
                Configure Gemini API Key
              </Button>
            )}
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Primary Specifications</CardTitle>
            <CardDescription>
              Basic event context, scheduling, location, and guest scale.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Event Name / Title"
                placeholder="e.g. Maya & Julian's Napa Valley Wedding"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={formErrors.name}
                required
              />

              <Select
                label="Event Category"
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value as EventType)}
                options={eventTypeOptions}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Event Date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                error={formErrors.date}
                required
              />

              <Input
                label="Location / Venue City"
                placeholder="e.g. St. Helena, California"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                error={formErrors.location}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Currency"
                value={formData.currency}
                onChange={(e) => handleInputChange("currency", e.target.value)}
                options={currencyOptions}
              />

              <Input
                label="Total Target Budget"
                type="number"
                min={100}
                step={100}
                placeholder="25000"
                value={formData.totalBudget}
                onChange={(e) => handleInputChange("totalBudget", Number(e.target.value))}
                error={formErrors.totalBudget}
                required
              />

              <Input
                label="Estimated Guest Count"
                type="number"
                min={1}
                placeholder="100"
                value={formData.guestCount}
                onChange={(e) => handleInputChange("guestCount", Number(e.target.value))}
                error={formErrors.guestCount}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Aesthetic & Culinary Preferences</CardTitle>
            <CardDescription>
              Guide Gemini&apos;s vision for themes, atmosphere, dietary requirements, and priority allocation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Budget Priority Focus"
              value={formData.preferences.priorityFocus}
              onChange={(e) => handlePreferenceChange("priorityFocus", e.target.value)}
              options={priorityOptions}
              helperText="Informs the AI model where to bias the financial distribution."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Theme & Design Concept (Optional)"
                placeholder="e.g. Rustic Tuscan warmth, botanical green & terracotta"
                value={formData.preferences.theme}
                onChange={(e) => handlePreferenceChange("theme", e.target.value)}
              />

              <Input
                label="Desired Vibe / Mood (Optional)"
                placeholder="e.g. Intimate, energetic jazz, candlelit dinner"
                value={formData.preferences.vibe}
                onChange={(e) => handlePreferenceChange("vibe", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Dietary & Bar Guidelines (Optional)"
                placeholder="e.g. Vegetarian-friendly, artisanal cocktails, nut allergies"
                value={formData.preferences.dietaryNotes}
                onChange={(e) => handlePreferenceChange("dietaryNotes", e.target.value)}
              />

              <Input
                label="Special Requests / Program Requirements (Optional)"
                placeholder="e.g. Sparkler send-off at 10 PM, outdoor sunset ceremony"
                value={formData.preferences.specialRequests}
                onChange={(e) => handlePreferenceChange("specialRequests", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-forest-950 text-sand-50 shadow-elevated">
          <div className="space-y-1">
            <h4 className="font-serif font-bold text-lg text-sand-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-champagne-400" />
              Generate Complete Blueprint
            </h4>
            <p className="text-xs text-sand-300 max-w-md">
              {modelDisplayName} will synthesize a complete, balanced budget, chronological milestones, and vendor checklists tailored to your inputs.
            </p>
          </div>

          <Button
            type="submit"
            variant="terracotta"
            size="lg"
            isLoading={isLoading}
            className="w-full sm:w-auto font-semibold px-8 shrink-0 gap-2"
          >
            {isLoading ? `Synthesizing Plan with ${modelDisplayName}...` : "Generate Event Plan"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
