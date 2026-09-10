import * as React from "react";
import type { FindingSeverity, ScanStatus, AssessmentPriority, TargetStatus } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "coral" | "lime" | "arc" | "muted";
  size?: "sm" | "md";
}

export function Badge({
  className = "",
  variant = "default",
  size = "sm",
  children,
  ...props
}: BadgeProps) {
  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";

  const variantClasses = {
    default: "bg-raised text-muted border-hairline",
    brand: "bg-brand-soft text-brand border-brand/30",
    coral: "bg-coral-soft text-coral-ink border-coral/30",
    lime: "bg-lime-soft text-lime-ink border-lime/40",
    arc: "bg-arc-soft text-arc border-arc/30",
    muted: "bg-sunken text-faint border-hairline",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium uppercase tracking-wider ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const config = {
    critical: {
      label: "Critical",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    high: {
      label: "High",
      className: "bg-coral-soft text-coral-ink border-coral/30",
      dot: "bg-coral",
    },
    medium: {
      label: "Medium",
      className: "bg-amber-50 text-amber-800 border-amber-200",
      dot: "bg-amber-500",
    },
    low: {
      label: "Low",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    informational: {
      label: "Info",
      className: "bg-gray-100 text-gray-700 border-gray-200",
      dot: "bg-gray-400",
    },
  }[severity];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export function ScanStatusBadge({ status }: { status: ScanStatus }) {
  const config = {
    queued: {
      label: "Queued",
      className: "bg-gray-100 text-gray-700 border-gray-200",
      dot: "bg-gray-400",
    },
    running: {
      label: "Running",
      className: "bg-brand-soft text-brand border-brand/30 animate-pulse",
      dot: "bg-brand",
    },
    completed: {
      label: "Completed",
      className: "bg-lime-soft text-lime-ink border-lime/40",
      dot: "bg-lime-ink",
    },
    failed: {
      label: "Failed",
      className: "bg-rose-50 text-rose-700 border-rose-200",
      dot: "bg-rose-500",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-sunken text-faint border-hairline",
      dot: "bg-faint",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${config.className}`}
    >
      <span className={`size-2 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

export function TargetStatusBadge({ status }: { status: TargetStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
        status === "active"
          ? "bg-lime-soft text-lime-ink border-lime/40"
          : "bg-sunken text-faint border-hairline"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${status === "active" ? "bg-lime-ink" : "bg-faint"}`}
        aria-hidden="true"
      />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

export function AiPriorityBadge({ priority }: { priority: AssessmentPriority }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-arc/30 bg-arc-soft px-2.5 py-1 text-xs font-semibold text-arc">
      <span className="text-[10px] font-bold tracking-wider opacity-80">AI:</span>
      <span className="capitalize">{priority}</span>
    </span>
  );
}
