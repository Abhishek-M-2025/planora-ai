import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // focus the close button or first interactive element
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-forest-950/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full max-w-lg rounded-2xl bg-white border border-sand-200 p-6 shadow-elevated z-10 transition-all",
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-sand-100">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-serif font-bold text-forest-950"
            >
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="text-sm text-sand-600 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="rounded-lg p-1.5 text-sand-500 hover:text-forest-900 hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4">{children}</div>
      </div>
    </div>
  );
}
