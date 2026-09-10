import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import TargetsPage from "@/app/(app)/targets/page";
import * as targetsLib from "@/lib/targets";
import type { Target } from "@/lib/types";

const mockTargets: Target[] = [
  {
    id: "target-1",
    name: "Production Gateway",
    url: "https://api.example.com",
    description: null,
    status: "active",
    createdAt: "2026-03-01T10:00:00.000Z",
    updatedAt: "2026-03-01T10:00:00.000Z",
  },
  {
    id: "target-2",
    name: "Staging Portal",
    url: "https://staging.example.com",
    description: null,
    status: "active",
    createdAt: "2026-03-02T10:00:00.000Z",
    updatedAt: "2026-03-02T10:00:00.000Z",
  },
];

describe("Targets Management Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton initially and then lists targets", async () => {
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue(mockTargets);

    render(<TargetsPage />);

    await waitFor(() => {
      expect(screen.getByText("Production Gateway")).toBeInTheDocument();
      expect(screen.getByText("https://api.example.com")).toBeInTheDocument();
      expect(screen.getByText("Staging Portal")).toBeInTheDocument();
    });
  });

  it("renders empty state with helpful prompt when user has no targets", async () => {
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue([]);

    render(<TargetsPage />);

    await waitFor(() => {
      expect(screen.getByText("No targets registered")).toBeInTheDocument();
      expect(screen.getByText("Add Your First Target")).toBeInTheDocument();
    });
  });

  it("validates empty name and target URL on submission", async () => {
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue(mockTargets);
    render(<TargetsPage />);

    await waitFor(() => {
      expect(screen.getByText("Production Gateway")).toBeInTheDocument();
    });

    const openBtn = screen.getByRole("button", { name: /add target/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const modal = screen.getByRole("dialog");
    const form = modal.querySelector("form")!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(within(modal).getByText("Name is required.")).toBeInTheDocument();
      expect(within(modal).getByText("URL is required.")).toBeInTheDocument();
    });
  });

  it("creates a new target and refreshes list", async () => {
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue(mockTargets);
    const newTarget: Target = {
      id: "target-3",
      name: "New Microservice",
      url: "https://auth.example.com",
      description: null,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    vi.spyOn(targetsLib, "createTargetRequest").mockResolvedValue(newTarget);

    render(<TargetsPage />);

    await waitFor(() => {
      expect(screen.getByText("Production Gateway")).toBeInTheDocument();
    });

    const openBtn = screen.getByRole("button", { name: /add target/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/Target Name/i), {
      target: { value: "New Microservice" },
    });
    fireEvent.change(within(modal).getByLabelText(/Target URL/i), {
      target: { value: "https://auth.example.com" },
    });

    const modalSubmit = within(modal).getByRole("button", { name: /add target/i });
    fireEvent.click(modalSubmit);

    await waitFor(() => {
      expect(targetsLib.createTargetRequest).toHaveBeenCalledWith({
        name: "New Microservice",
        url: "https://auth.example.com",
        description: undefined,
      });
      expect(screen.getByText("New Microservice")).toBeInTheDocument();
    });
  });

  it("handles backend validation/conflict errors gracefully", async () => {
    vi.spyOn(targetsLib, "listTargetsRequest").mockResolvedValue(mockTargets);
    vi.spyOn(targetsLib, "createTargetRequest").mockRejectedValue(
      new Error("Target with this URL already exists for your account.")
    );

    render(<TargetsPage />);

    await waitFor(() => {
      expect(screen.getByText("Production Gateway")).toBeInTheDocument();
    });

    const openBtn = screen.getByRole("button", { name: /add target/i });
    fireEvent.click(openBtn);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const modal = screen.getByRole("dialog");
    fireEvent.change(within(modal).getByLabelText(/Target Name/i), {
      target: { value: "Duplicate" },
    });
    fireEvent.change(within(modal).getByLabelText(/Target URL/i), {
      target: { value: "https://api.example.com" },
    });

    const modalSubmit = within(modal).getByRole("button", { name: /add target/i });
    fireEvent.click(modalSubmit);

    await waitFor(() => {
      expect(
        within(modal).getByText("Target with this URL already exists for your account.")
      ).toBeInTheDocument();
    });
  });
});
