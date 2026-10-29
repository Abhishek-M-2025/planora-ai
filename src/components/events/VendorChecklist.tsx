"use client";

import React, { useState } from "react";
import { EventPlan, VendorChecklistItem, VendorStatus } from "@/lib/types";
import { formatCurrency } from "@/lib/budget-calc";
import { updateEvent } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Modal } from "@/ui/Modal";
import { Badge } from "@/ui/Badge";
import {
  Briefcase,
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface VendorChecklistProps {
  event: EventPlan;
  onEventUpdated: (updated: EventPlan) => void;
}

export function VendorChecklist({ event, onEventUpdated }: VendorChecklistProps) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorChecklistItem | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Catering");
  const [formService, setFormService] = useState("");
  const [formEstimatedCost, setFormEstimatedCost] = useState<number>(0);
  const [formActualCost, setFormActualCost] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<VendorStatus>("not_contacted");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const categories = Array.from(new Set(event.vendors.map((v) => v.category)));

  const filteredVendors = event.vendors.filter((v) =>
    activeCategoryFilter === "all" ? true : v.category === activeCategoryFilter
  );

  const contractedCount = event.vendors.filter((v) => v.status === "contract_signed").length;

  const openAddModal = () => {
    setEditingVendor(null);
    setFormName("");
    setFormCategory("Catering");
    setFormService("");
    setFormEstimatedCost(1000);
    setFormActualCost(0);
    setFormStatus("not_contacted");
    setFormEmail("");
    setFormPhone("");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (vendor: VendorChecklistItem) => {
    setEditingVendor(vendor);
    setFormName(vendor.vendorName);
    setFormCategory(vendor.category);
    setFormService(vendor.service);
    setFormEstimatedCost(vendor.estimatedCost);
    setFormActualCost(vendor.actualCost || 0);
    setFormStatus(vendor.status);
    setFormEmail(vendor.contactEmail || "");
    setFormPhone(vendor.contactPhone || "");
    setFormNotes(vendor.notes || "");
    setIsModalOpen(true);
  };

  const handleStatusChange = (vendorId: string, newStatus: VendorStatus) => {
    const updated = updateEvent(event.id, (prev) => ({
      ...prev,
      vendors: prev.vendors.map((v) =>
        v.id === vendorId ? { ...v, status: newStatus } : v
      ),
    }));
    if (updated) {
      onEventUpdated(updated);
    }
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formService.trim()) return;

    const updated = updateEvent(event.id, (prev) => {
      let updatedVendors: VendorChecklistItem[];
      if (editingVendor) {
        updatedVendors = prev.vendors.map((v) =>
          v.id === editingVendor.id
            ? {
                ...v,
                vendorName: formName.trim(),
                category: formCategory.trim(),
                service: formService.trim(),
                estimatedCost: Number(formEstimatedCost) || 0,
                actualCost: Number(formActualCost) || undefined,
                status: formStatus,
                contactEmail: formEmail.trim() || undefined,
                contactPhone: formPhone.trim() || undefined,
                notes: formNotes.trim() || undefined,
              }
            : v
        );
      } else {
        const newVendor: VendorChecklistItem = {
          id: `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          vendorName: formName.trim(),
          category: formCategory.trim(),
          service: formService.trim(),
          estimatedCost: Number(formEstimatedCost) || 0,
          actualCost: Number(formActualCost) || undefined,
          status: formStatus,
          contactEmail: formEmail.trim() || undefined,
          contactPhone: formPhone.trim() || undefined,
          notes: formNotes.trim() || undefined,
        };
        updatedVendors = [...prev.vendors, newVendor];
      }
      return {
        ...prev,
        vendors: updatedVendors,
      };
    });

    if (updated) {
      onEventUpdated(updated);
    }
    setIsModalOpen(false);
  };

  const handleDeleteVendor = (vendorId: string) => {
    if (confirm("Remove this vendor from checklist?")) {
      const updated = updateEvent(event.id, (prev) => ({
        ...prev,
        vendors: prev.vendors.filter((v) => v.id !== vendorId),
      }));
      if (updated) {
        onEventUpdated(updated);
      }
    }
  };

  const statusOptions = [
    { value: "not_contacted", label: "Not Contacted" },
    { value: "inquired", label: "Inquired / Initial Outreach" },
    { value: "quote_received", label: "Proposal / Quote Received" },
    { value: "negotiating", label: "In Negotiation" },
    { value: "contract_signed", label: "Contract Executed & Booked" },
    { value: "declined", label: "Declined / Passed" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white border border-sand-200/90 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif font-bold text-lg text-forest-950">
            Vendor Directory & Outreach Pipeline
          </h3>
          <p className="text-xs text-sand-600">
            {contractedCount} of {event.vendors.length} vendors contracted. Track pricing quotes, contracts, and contact communications.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={openAddModal} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" />
          Add Vendor
        </Button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategoryFilter("all")}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeCategoryFilter === "all"
              ? "bg-forest-900 text-sand-50"
              : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
          }`}
        >
          All Categories ({event.vendors.length})
        </button>

        {categories.map((cat) => {
          const count = event.vendors.filter((v) => v.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategoryFilter === cat
                  ? "bg-forest-900 text-sand-50"
                  : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendor Cards Grid */}
      {filteredVendors.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Briefcase className="w-8 h-8 text-sand-400 mx-auto" />
          <h4 className="font-serif font-bold text-lg text-forest-950">
            No Vendors in this Category
          </h4>
          <p className="text-xs text-sand-500 max-w-sm mx-auto">
            Add a supplier or professional partner to track contact status and quotes.
          </p>
          <Button variant="outline" size="sm" onClick={openAddModal}>
            Add First Vendor
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => {
            const isContracted = vendor.status === "contract_signed";

            const statusColors: Record<VendorStatus, { badge: "sand" | "champagne" | "forest" | "success" | "danger" }> = {
              not_contacted: { badge: "sand" },
              inquired: { badge: "champagne" },
              quote_received: { badge: "champagne" },
              negotiating: { badge: "champagne" },
              contract_signed: { badge: "success" },
              declined: { badge: "danger" },
            };

            return (
              <Card
                key={vendor.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-forest-700/40 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-sand-500">
                        {vendor.category}
                      </span>
                      <h4 className="font-serif font-bold text-lg text-forest-950 leading-tight">
                        {vendor.vendorName}
                      </h4>
                      <p className="text-xs text-forest-800 font-medium mt-0.5">
                        {vendor.service}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(vendor)}
                        className="p-1.5 rounded-lg text-sand-400 hover:text-forest-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
                        aria-label={`Edit ${vendor.vendorName}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteVendor(vendor.id)}
                        className="p-1.5 rounded-lg text-sand-400 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                        aria-label={`Delete ${vendor.vendorName}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {vendor.aiSuggestionReason && (
                    <div className="p-2.5 rounded-lg bg-sand-50 border border-sand-200/80 text-xs text-sand-700 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-champagne-600 shrink-0 mt-0.5" />
                      <span>{vendor.aiSuggestionReason}</span>
                    </div>
                  )}

                  {vendor.notes && (
                    <p className="text-xs text-sand-600 italic">
                      Note: {vendor.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-3 pt-3 border-t border-sand-100">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="text-sand-500">Estimated: </span>
                      <span className="font-semibold text-forest-950">
                        {formatCurrency(vendor.estimatedCost, event.currency)}
                      </span>
                    </div>
                    {vendor.actualCost && (
                      <div>
                        <span className="text-sand-500">Final Agreed: </span>
                        <span className="font-bold text-emerald-700">
                          {formatCurrency(vendor.actualCost, event.currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-sand-500">Status:</span>
                    <select
                      value={vendor.status}
                      onChange={(e) =>
                        handleStatusChange(vendor.id, e.target.value as VendorStatus)
                      }
                      className="text-xs font-semibold rounded-lg border border-sand-300 bg-white px-2.5 py-1 text-forest-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(vendor.contactEmail || vendor.contactPhone) && (
                    <div className="flex items-center gap-4 text-xs text-sand-600 pt-1">
                      {vendor.contactEmail && (
                        <a
                          href={`mailto:${vendor.contactEmail}`}
                          className="flex items-center gap-1 hover:text-forest-900 truncate"
                        >
                          <Mail className="w-3.5 h-3.5 text-sand-400" />
                          {vendor.contactEmail}
                        </a>
                      )}
                      {vendor.contactPhone && (
                        <a
                          href={`tel:${vendor.contactPhone}`}
                          className="flex items-center gap-1 hover:text-forest-900"
                        >
                          <Phone className="w-3.5 h-3.5 text-sand-400" />
                          {vendor.contactPhone}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? "Edit Vendor Details" : "Add Vendor to Checklist"}
        description="Maintain quotes, point of contact, and contract statuses."
      >
        <form onSubmit={handleSaveVendor} className="space-y-4">
          <Input
            label="Vendor / Firm Name"
            placeholder="e.g. Sonoma Valley Vineyard Estates"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Category"
              placeholder="e.g. Catering / Floral / Photography"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              required
            />

            <Input
              label="Deliverable Service"
              placeholder="e.g. Plated Dinner & Wine Pairing"
              value={formService}
              onChange={(e) => setFormService(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Estimated Quote (${event.currency})`}
              type="number"
              min={0}
              step={50}
              value={formEstimatedCost}
              onChange={(e) => setFormEstimatedCost(Number(e.target.value))}
              required
            />

            <Input
              label={`Actual Contract Amount (${event.currency})`}
              type="number"
              min={0}
              step={50}
              value={formActualCost}
              onChange={(e) => setFormActualCost(Number(e.target.value))}
            />
          </div>

          <Select
            label="Current Status"
            value={formStatus}
            onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
            options={statusOptions}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Email"
              type="email"
              placeholder="events@vineyard.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
            />

            <Input
              label="Contact Phone"
              placeholder="+1 (555) 349-2041"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
            />
          </div>

          <Input
            label="Internal Notes"
            placeholder="e.g. Includes cake cutting fee and tables/chairs rental"
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
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
              {editingVendor ? "Save Vendor" : "Add Vendor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
