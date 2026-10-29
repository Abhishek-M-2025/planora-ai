import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
    const errorId = error && inputId ? `${inputId}-error` : undefined;
    const helperId = helperText && inputId ? `${inputId}-helper` : undefined;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-sand-800"
          >
            {label}
            {props.required && <span className="text-terracotta-500 ml-1">*</span>}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          type={type}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            "flex h-10 w-full rounded-lg border border-sand-300 bg-white px-3 py-2 text-sm text-forest-950 placeholder:text-sand-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 focus-visible:border-forest-800 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-600 focus-visible:border-red-600",
            className
          )}
          {...props}
        />
        {helperText && !error && (
          <p id={helperId} className="text-xs text-sand-500">
            {helperText}
          </p>
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

Input.displayName = "Input";
