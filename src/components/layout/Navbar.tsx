"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { Button } from "@/ui/Button";
import { PlusCircle, Key, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  onOpenApiKeyModal: () => void;
  hasApiKey: boolean;
}

export function Navbar({ onOpenApiKeyModal, hasApiKey }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sand-200/90 bg-white/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
      {/* Mobile brand & menu trigger */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg text-forest-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Logo size="sm" />
      </div>

      {/* Desktop context/status indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs text-sand-600">
        <span className="font-medium text-forest-900">Planora Studio</span>
        <span>/</span>
        <span className="capitalize">
          {pathname === "/"
            ? "Dashboard"
            : pathname.split("/")[1] || "Overview"}
        </span>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onOpenApiKeyModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sand-200 text-xs font-medium text-forest-900 hover:bg-sand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 transition-colors"
          aria-label="Gemini API Key configuration"
        >
          <Key className="w-3.5 h-3.5 text-sand-600" />
          <span className="hidden sm:inline">
            {hasApiKey ? "Gemini Ready" : "Setup API Key"}
          </span>
          <span
            className={`w-2 h-2 rounded-full ${
              hasApiKey ? "bg-emerald-500" : "bg-amber-400"
            }`}
          />
        </button>

        <Link href="/events/new">
          <Button variant="primary" size="sm" className="gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Plan New Event</span>
            <span className="sm:hidden">New</span>
          </Button>
        </Link>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white border-b border-sand-200 shadow-elevated p-4 md:hidden flex flex-col space-y-2">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-sand-100 text-forest-950"
          >
            Dashboard
          </Link>
          <Link
            href="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-sand-100 text-forest-950"
          >
            All Events
          </Link>
          <Link
            href="/events/new"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-sand-100 text-forest-950"
          >
            Plan New Event
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenApiKeyModal();
            }}
            className="px-3 py-2 text-left rounded-lg text-sm font-medium hover:bg-sand-100 text-forest-950 flex items-center justify-between"
          >
            <span>Gemini API Status</span>
            <span
              className={`w-2 h-2 rounded-full ${
                hasApiKey ? "bg-emerald-500" : "bg-amber-400"
              }`}
            />
          </button>
        </div>
      )}
    </header>
  );
}
