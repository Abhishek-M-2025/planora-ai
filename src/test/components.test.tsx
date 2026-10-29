import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Alert } from "@/components/ui/Alert";
import { Modal } from "@/components/ui/Modal";

describe("Accessible UI Component Library (WCAG 2.2 AA)", () => {
  it("renders Button with proper role, triggers click and handles loading state", () => {
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button onClick={handleClick}>Confirm Booking</Button>
    );

    const btn = screen.getByRole("button", { name: /confirm booking/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Test loading state with aria-busy
    rerender(
      <Button isLoading onClick={handleClick}>
        Confirm Booking
      </Button>
    );
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn).toBeDisabled();
  });

  it("renders ProgressBar with proper ARIA attributes", () => {
    render(<ProgressBar value={75} max={100} label="Budget Utilized" showPercentage />);

    const bar = screen.getByRole("progressbar", { name: /budget utilized/i });
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute("aria-valuenow", "75");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("renders Alert with role=alert and triggers onDismiss", () => {
    const handleDismiss = vi.fn();
    render(
      <Alert variant="warning" title="Budget Notice" onDismiss={handleDismiss}>
        Allocation exceeded limit.
      </Alert>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(screen.getByText("Budget Notice")).toBeInTheDocument();

    const closeBtn = screen.getByRole("button", { name: /dismiss alert/i });
    fireEvent.click(closeBtn);
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders Modal dialog with ARIA attributes and Escape key listener", () => {
    const handleClose = vi.fn();
    render(
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="Add Expense"
        description="Fill in line item"
      >
        <div>Modal Body Content</div>
      </Modal>
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("Add Expense")).toBeInTheDocument();

    // Trigger escape key
    fireEvent.keyDown(window, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
