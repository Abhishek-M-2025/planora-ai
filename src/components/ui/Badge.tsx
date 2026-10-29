import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "forest"
    | "terracotta"
    | "champagne"
    | "sand"
    | "outline"
    | "danger"
    | "success";
}

export function Badge({
  className,
  variant = "sand",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    forest: "bg-forest-100 text-forest-900 border-forest-200/80",
    terracotta: "bg-terracotta-100 text-terracotta-900 border-terracotta-200/80",
    champagne: "bg-champagne-100 text-champagne-900 border-champagne-300/80",
    sand: "bg-sand-100 text-sand-800 border-sand-200",
    outline: "bg-transparent text-forest-900 border-sand-300",
    danger: "bg-red-50 text-red-800 border-red-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
