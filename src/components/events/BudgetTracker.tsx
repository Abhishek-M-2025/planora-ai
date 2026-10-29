"use client";

import React, { useState } from "react";
import { EventPlan, BudgetItem, BudgetCategory, BudgetItemStatus } from "@/lib/types";
import {
  calculateBudgetSummary,
  formatCurrency,
  getBudgetWarnings,
  BUDGET_CATEGORIES,
} from "@/lib/budget-calc";
import { updateEvent } from "@/lib/storage";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";
import { Modal } from "@/ui/Modal";
import { Badge } from "@/ui/Badge";
import { Alert } from "@/ui/Alert";
import { ProgressBar } from "@/ui/ProgressBar";
import {
  Plus,
  DollarSign,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  PieChart,
  ArrowUpRight,
} from "lucide-react";

interface BudgetTrackerProps {
  event: EventPlan;
  onEventUpdated: (updated: EventPlan) => void;
}

export function BudgetTracker({ event, onEventUpdated }: BudgetTrackerProps) {
  const summary = calculateBudgetSummary(event.totalBudget, event.budgetItems);
  const warnings = getBudgetWarnings(summary, event.budgetItems);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  // Form states for modal
  const [formCategory, setFormCategory] = useState<BudgetCategory>("venue");
  const [formName, setFormName] = useState("");
  const [formAllocated, setFormAllocated] = useState<number>(0);
  const [formActual, setFormActual] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<BudgetItemStatus>("planned");
  const [formNotes, setFormNotes] = useState("");

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");

  const openAddModal = () => {
    setEditingItem(null);
    setFormCategory("venue");
    setFormName("");
    setFormAllocated(0);
    setFormActual(0);
    setFormStatus("planned");
    setFormNotes("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: BudgetItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormName(item.name);
    setFormAllocated(item.allocatedAmount);
    setFormActual(item.actualAmount);
    setFormStatus(item.status);
    setFormNotes(item.notes || "");
    setIsModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const updated = updateEvent(event.id, (prev) => {
      let updatedItems: BudgetItem[];
      if (editingItem) {
        updatedItems = prev.budgetItems.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                category: formCategory,
                name: formName.trim(),
                allocatedAmount: Number(formAllocated) || 0,
                actualAmount: Number(formActual) || 0,
                status: formStatus,
                notes: formNotes.trim(),
              }
            : item
        );
      } else {
        const newItem: BudgetItem = {
          id: `bi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          category: formCategory,
          name: formName.trim(),
          allocatedAmount: Number(formAllocated) || 0,
          actualAmount: Number(formActual) || 0,
          status: formStatus,
          notes: formNotes.trim(),
        };
        updatedItems = [...prev.budgetItems, newItem];
      }
      return {
        ...prev,
        budgetItems: updatedItems,
      };
    });

    if (updated) {
      onEventUpdated(updated);
    }
    setIsModalOpen(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to remove this budget line item?")) {
      const updated = updateEvent(event.id, (prev) => ({
        ...prev,
        budgetItems: prev.budgetItems.filter((item) => item.id !== itemId),
      }));
      if (updated) {
        onEventUpdated(updated);
      }
    }
  };

  const categoryOptions = BUDGET_CATEGORIES.map((c) => ({
    value: c.id,
    label: c.label,
  }));

  const statusOptions = [
    { value: "planned", label: "Planned (Not Paid)" },
    { value: "deposit_paid", label: "Deposit Paid" },
    { value: "paid_in_full", label: "Paid in Full" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const filteredItems = event.budgetItems.filter((item) =>
    activeCategoryFilter === "all" ? true : item.category === activeCategoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Top Warning Banners if over budget */}
      {warnings.map((w, idx) => (
        <Alert
          key={idx}
          variant={w.type === "danger" ? "danger" : w.type === "warning" ? "warning" : "info"}
        >
          {w.message}
        </Alert>
      ))}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-sand-500">
            Total Target Budget
          </div>
          <div className="text-2xl font-serif font-bold text-forest-950">
            {formatCurrency(summary.totalBudget, event.currency)}
          </div>
          <p className="text-xs text-sand-500">Established financial ceiling</p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-sand-500">
            Total Planned Allocation
          </div>
          <div className="text-2xl font-serif font-bold text-forest-900">
            {formatCurrency(summary.totalAllocated, event.currency)}
          </div>
          <p className="text-xs text-sand-500">
            {summary.remainingAllocated >= 0
              ? `${formatCurrency(summary.remainingAllocated, event.currency)} unallocated`
              : `${formatCurrency(Math.abs(summary.remainingAllocated), event.currency)} over allocation`}
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-sand-500">
            Actual Spent to Date
          </div>
          <div className="text-2xl font-serif font-bold text-terracotta-600">
            {formatCurrency(summary.totalActual, event.currency)}
          </div>
          <p className="text-xs text-sand-500">
            {summary.percentageUsed}% of total budget disbursed
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-sand-500">
            Remaining Cash Balance
          </div>
          <div
            className={`text-2xl font-serif font-bold ${
              summary.remainingActual < 0 ? "text-red-600" : "text-emerald-700"
            }`}
          >
            {formatCurrency(summary.remainingActual, event.currency)}
          </div>
          <p className="text-xs text-sand-500">
            {summary.remainingActual < 0 ? "Deficit warning" : "Available to spend"}
          </p>
        </Card>
      </div>

      {/* Category Breakdown Progress */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="w-4 h-4 text-forest-700" />
              Category Allocation Breakdown
            </CardTitle>
            <span className="text-xs text-sand-500">
              {summary.categoryBreakdown.length} active categories
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {summary.categoryBreakdown.map((cat) => {
              const label =
                BUDGET_CATEGORIES.find((c) => c.id === cat.category)?.label ||
                cat.category;
              return (
                <div key={cat.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-forest-950 capitalize">
                      {label}
                    </span>
                    <span className="text-sand-600">
                      {formatCurrency(cat.allocated, event.currency)} ({Math.round(cat.percentage)}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={cat.allocated}
                    max={summary.totalBudget}
                    variant="forest"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Line Items Table and Actions */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeCategoryFilter === "all"
                  ? "bg-forest-900 text-sand-50"
                  : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
              }`}
            >
              All Items ({event.budgetItems.length})
            </button>
            {BUDGET_CATEGORIES.map((c) => {
              const count = event.budgetItems.filter((i) => i.category === c.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategoryFilter(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    activeCategoryFilter === c.id
                      ? "bg-forest-900 text-sand-50"
                      : "bg-white text-sand-700 border border-sand-200 hover:bg-sand-50"
                  }`}
                >
                  {c.label} ({count})
                </button>
              );
            })}
          </div>

          <Button variant="primary" size="sm" onClick={openAddModal} className="gap-1.5 shrink-0">
            <Plus className="w-4 h-4" />
            Add Budget Item
          </Button>
        </div>

        {/* Table Card */}
        <Card className="overflow-hidden">
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <DollarSign className="w-8 h-8 text-sand-400 mx-auto" />
              <h4 className="font-serif font-bold text-lg text-forest-950">
                No Line Items in this Category
              </h4>
              <p className="text-xs text-sand-500 max-w-sm mx-auto">
                Add an expense item to track planned allocations and actual payments.
              </p>
              <Button variant="outline" size="sm" onClick={openAddModal}>
                Add First Line Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm" aria-label="Budget Line Items">
                <thead className="bg-sand-50/80 border-b border-sand-200 text-xs font-bold uppercase tracking-wider text-sand-600">
                  <tr>
                    <th scope="col" className="py-3 px-4">Item & Category</th>
                    <th scope="col" className="py-3 px-4">Planned</th>
                    <th scope="col" className="py-3 px-4">Actual Paid</th>
                    <th scope="col" className="py-3 px-4">Variance</th>
                    <th scope="col" className="py-3 px-4">Status</th>
                    <th scope="col" className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand-100">
                  {filteredItems.map((item) => {
                    const variance = item.allocatedAmount - item.actualAmount;
                    const isItemOver = item.actualAmount > item.allocatedAmount;

                    const statusBadge: Record<BudgetItemStatus, "sand" | "champagne" | "success" | "danger"> = {
                      planned: "sand",
                      deposit_paid: "champagne",
                      paid_in_full: "success",
                      cancelled: "danger",
                    };

                    const categoryLabel =
                      BUDGET_CATEGORIES.find((c) => c.id === item.category)?.label ||
                      item.category;

                    return (
                      <tr key={item.id} className="hover:bg-sand-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-forest-950">{item.name}</div>
                          <div className="text-xs text-sand-500 flex items-center gap-2">
                            <span>{categoryLabel}</span>
                            {item.notes && <span className="italic truncate max-w-xs">&bull; {item.notes}</span>}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-medium text-forest-900">
                          {formatCurrency(item.allocatedAmount, event.currency)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-forest-950">
                          {formatCurrency(item.actualAmount, event.currency)}
                        </td>
                        <td className="py-3 px-4 text-xs font-medium">
                          {isItemOver ? (
                            <span className="text-red-600">
                              +{formatCurrency(Math.abs(variance), event.currency)} over
                            </span>
                          ) : (
                            <span className="text-emerald-700">
                              {formatCurrency(variance, event.currency)} remaining
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusBadge[item.status]}>
                            {item.status.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-1.5 rounded-lg text-sand-600 hover:text-forest-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg text-sand-600 hover:text-red-700 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Budget Line Item" : "Add Budget Line Item"}
        description="Allocate planned costs and record actual payments."
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <Input
            label="Item Description"
            placeholder="e.g. Reception Catering & Staffing"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as BudgetCategory)}
              options={categoryOptions}
            />

            <Select
              label="Payment Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as BudgetItemStatus)}
              options={statusOptions}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={`Planned Allocation (${event.currency})`}
              type="number"
              min={0}
              step={10}
              value={formAllocated}
              onChange={(e) => setFormAllocated(Number(e.target.value))}
              required
            />

            <Input
              label={`Actual Disbursed (${event.currency})`}
              type="number"
              min={0}
              step={10}
              value={formActual}
              onChange={(e) => setFormActual(Number(e.target.value))}
            />
          </div>

          <Input
            label="Notes / Vendor Reference (Optional)"
            placeholder="e.g. 50% deposit paid on contract execution"
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
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
