"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import {
  LayoutDashboard,
  CalendarDays,
  PlusCircle,
  Sparkles,
  Key,
  HelpCircle,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
  modelDisplayName?: string;
}

export function Sidebar({
  onOpenApiKeyModal,
  hasApiKey,
  modelDisplayName = "Gemini 3.8 Flash",
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      active: pathname === "/",
    },
    {
      label: "All Events",
      href: "/events",
      icon: CalendarDays,
      active: pathname === "/events",
    },
    {
      label: "Plan New Event",
      href: "/events/new",
      icon: PlusCircle,
      active: pathname === "/events/new",
    },
  ];

  return (
    <aside
      className="w-64 border-r border-[#D3E5D5] bg-[#E7F1E8] flex flex-col justify-between shrink-0 min-h-screen p-5"
      aria-label="Main Navigation"
    >
      <div className="space-y-6">
        {/* Custom Planora AI Logo */}
        <div className="px-1 py-1">
          <Logo size="md" />
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5" aria-label="Sidebar Links">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-forest-800/70 mb-2">
            Overview
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800",
                  item.active
                    ? "bg-forest-900 text-white shadow-sm font-semibold"
                    : "text-forest-900/85 hover:bg-[#D7E8D8] hover:text-forest-950"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    item.active
                      ? "text-sand-100"
                      : "text-forest-700/80 group-hover:text-forest-950"
                  )}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Gemini AI status and quick settings */}
      <div className="pt-4 border-t border-[#D3E5D5] space-y-3">
        <div className="p-3.5 rounded-xl bg-white/90 border border-[#CFE2D2] shadow-subtle space-y-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-forest-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-champagne-600" />
              Gemini Engine
            </span>
            <span
              className={cn(
                "w-2.5 h-2.5 rounded-full ring-2 ring-white",
                hasApiKey ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
              )}
              title={hasApiKey ? `${modelDisplayName} Ready` : "API Key Needed"}
            />
          </div>
          <p className="text-[11px] text-forest-900/75 leading-tight">
            {hasApiKey
              ? `${modelDisplayName} Connected`
              : "API Key required for live synthesis"}
          </p>
          <button
            onClick={onOpenApiKeyModal}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium text-forest-950 bg-[#E0EFE1] hover:bg-[#D0E5D2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 transition-colors"
          >
            <Key className="w-3 h-3 text-forest-700" />
            {hasApiKey ? "Manage API Key" : "Configure API Key"}
          </button>
        </div>

        <div className="px-2 text-[11px] text-forest-800/70 flex items-center justify-between">
          <span>Planora AI v1.0</span>
          <span className="text-[10px] bg-[#D7E8D8] px-1.5 py-0.5 rounded text-forest-900 font-medium">
            Client Persistence
          </span>
        </div>
      </div>
    </aside>
  );
}
