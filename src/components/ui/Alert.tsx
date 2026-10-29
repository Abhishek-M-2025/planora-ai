import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "danger" | "success";
  title?: string;
  onDismiss?: () => void;
}

export function Alert({
  variant = "info",
  title,
  children,
  className,
  onDismiss,
  ...props
}: AlertProps) {
  const styles = {
    info: {
      container: "bg-forest-50/80 border-forest-200 text-forest-950",
      icon: <Info className="w-5 h-5 text-forest-700 shrink-0" aria-hidden="true" />,
    },
    warning: {
      container: "bg-amber-50/90 border-amber-300 text-amber-950",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />,
    },
    danger: {
      container: "bg-red-50 border-red-300 text-red-950",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" aria-hidden="true" />,
    },
    success: {
      container: "bg-emerald-50 border-emerald-300 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />,
    },
  };

  const current = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-sm shadow-subtle relative",
        current.container,
        className
      )}
      {...props}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-sm leading-tight">{title}</h5>}
        <div className="text-sm opacity-95">{children}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-sand-500 hover:text-sand-800 rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
