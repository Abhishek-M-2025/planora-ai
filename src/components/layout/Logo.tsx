import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", iconOnly = false, size = "md" }: LogoProps) {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 rounded-lg p-1 transition-transform ${className}`}
      aria-label="Planora AI Home"
    >
      {/* Custom Art-Directed SVG Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-xl bg-forest-900 shadow-sm border border-forest-800/80 group-hover:border-forest-700 transition-colors shrink-0`}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6"
          aria-hidden="true"
        >
          {/* Interlocking Arch Rings representing harmony and planning */}
          <circle
            cx="18"
            cy="18"
            r="12"
            stroke="#278C5E"
            strokeWidth="2.2"
            strokeDasharray="4 2"
            opacity="0.8"
          />
          <path
            d="M10 24C10 17.3726 15.3726 12 22 12"
            stroke="#EADCC1"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* AI Sparkle / Star in Terracotta & Champagne */}
          <path
            d="M23 8L24.2 11.8L28 13L24.2 14.2L23 18L21.8 14.2L18 13L21.8 11.8L23 8Z"
            fill="#D4A34B"
          />
          <circle cx="13" cy="22" r="2.5" fill="#C86446" />
        </svg>
      </div>

      {!iconOnly && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-serif font-bold tracking-tight text-forest-950 dark:text-forest-50 ${textSizes[size]}`}
            >
              Planora
            </span>
            <span className="text-[10px] font-sans font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
              AI
            </span>
          </div>
          <span className="text-[11px] font-medium text-sand-600 -mt-0.5 tracking-wide">
            Intelligent Event Studio
          </span>
        </div>
      )}
    </Link>
  );
}
