import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, options, error, helperText, id, children, ...props },
    ref
  ) => {
    const selectId =
      id || (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorId = error && selectId ? `${selectId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-sand-800"
          >
            {label}
            {props.required && <span className="text-terracotta-500 ml-1">*</span>}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "flex h-10 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 focus-visible:border-forest-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-600",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>
        {helperText && !error && (
          <p className="text-xs text-sand-500">{helperText}</p>
        )}
        {error && (
          <p id={errorId} className="text-xs font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
