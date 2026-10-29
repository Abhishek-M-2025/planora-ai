import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "terracotta"
    | "outline"
    | "ghost"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none rounded-lg";

    const variantStyles = {
      primary:
        "bg-forest-900 text-sand-50 hover:bg-forest-800 active:bg-forest-950 focus-visible:ring-forest-800 shadow-sm",
      secondary:
        "bg-sand-100 text-forest-900 hover:bg-sand-200 active:bg-sand-300 focus-visible:ring-sand-400 border border-sand-300/80",
      terracotta:
        "bg-terracotta-500 text-white hover:bg-terracotta-600 active:bg-terracotta-700 focus-visible:ring-terracotta-500 shadow-sm",
      outline:
        "border border-forest-800/30 text-forest-900 bg-transparent hover:bg-forest-50 active:bg-forest-100 focus-visible:ring-forest-800",
      ghost:
        "text-forest-900 hover:bg-sand-100 active:bg-sand-200 focus-visible:ring-forest-800",
      destructive:
        "bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:ring-red-600 shadow-sm",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading ? "true" : undefined}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
