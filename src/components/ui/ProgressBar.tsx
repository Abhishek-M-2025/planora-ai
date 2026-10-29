import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0 to 100+
  max?: number;
  className?: string;
  variant?: "auto" | "forest" | "terracotta" | "danger";
  label?: string;
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className,
  variant = "auto",
  label,
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  const isOver = value > max;

  let barColor = "bg-forest-700";
  if (variant === "auto") {
    if (isOver || percentage > 95) {
      barColor = "bg-red-600";
    } else if (percentage > 80) {
      barColor = "bg-terracotta-500";
    } else {
      barColor = "bg-forest-700";
    }
  } else if (variant === "danger") {
    barColor = "bg-red-600";
  } else if (variant === "terracotta") {
    barColor = "bg-terracotta-500";
  } else if (variant === "forest") {
    barColor = "bg-forest-700";
  }

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs font-medium text-sand-700">
          <span>{label}</span>
          {showPercentage && (
            <span className={cn(isOver ? "text-red-700 font-bold" : "text-forest-900")}>
              {percentage}% {isOver && "(Over limit)"}
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
        className="w-full h-2.5 rounded-full bg-sand-200 overflow-hidden relative"
      >
        <div
          className={cn("h-full transition-all duration-500 rounded-full", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
