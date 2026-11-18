import React from "react";
import { cn } from "@/lib/utils";

export function SectionEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9E6B4B]",
        className
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  variant = "cream",
  className,
}: {
  children: React.ReactNode;
  variant?: "cream" | "sand" | "white" | "forest" | "gold" | "obsidian";
  className?: string;
}) {
  const variantClasses = {
    cream: "bg-[#FAF8F5] border-[#E4DDD1] text-[#1C201E]",
    sand: "bg-[#F2EFE9] border-[#E4DDD1] text-[#1C201E]",
    white: "bg-white border-[#E4DDD1] text-[#1C201E]",
    forest: "bg-[#1B3B2B] border-[#29523D] text-white",
    gold: "bg-[#C8B289] border-[#B49B6E] text-[#1B3B2B]",
    obsidian: "bg-[#1E2422] border-[#313A37] text-white",
  }[variant];

  return (
    <div className={cn("rounded-2xl border p-6 shadow-xs", variantClasses, className)}>
      {children}
    </div>
  );
}

export function TierBadge({
  tier,
  className,
}: {
  tier: "ORIGEN" | "ORO" | "DIAMANTE";
  className?: string;
}) {
  const styles = {
    ORIGEN: "bg-[#1B3B2B] text-white border-[#1B3B2B]",
    ORO: "bg-[#C8B289] text-[#1B3B2B] border-[#B89F72]",
    DIAMANTE: "bg-[#1E2422] text-[#E8D8B9] border-[#3B4441]",
  }[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em]",
        styles,
        className
      )}
    >
      {tier}
    </span>
  );
}

export function StatusBadge({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "info" | "danger";
  className?: string;
}) {
  const styles = {
    neutral: "bg-[#F2EFE9] text-[#5E645F] border-[#E4DDD1]",
    success: "bg-[#E6F2EB] text-[#1B3B2B] border-[#BBD8C7]",
    warning: "bg-[#FBF3E2] text-[#8A5A19] border-[#E8D1A3]",
    info: "bg-[#EFEBE6] text-[#9E6B4B] border-[#DFCFC2]",
    danger: "bg-[#FCECEC] text-[#9B2C2C] border-[#F2C3C3]",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        styles,
        className
      )}
    >
      {label}
    </span>
  );
}

export function ProgressBar({
  valuePct,
  barClassName,
  className,
}: {
  valuePct: number;
  barClassName?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, valuePct));
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-[#E6DFD3]",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-[#1B3B2B] transition-all duration-500",
          barClassName
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

export const inputBaseClass =
  "w-full rounded-xl border border-[#DCD4C6] bg-white px-3.5 py-2.5 text-sm text-[#1C201E] placeholder:text-[#8E938E] focus:border-[#1B3B2B] focus:outline-none focus:ring-2 focus:ring-[#1B3B2B]/15 disabled:bg-[#F2EFE9] disabled:text-[#7B807B]";

export const labelBaseClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.1em] text-[#4C524E]";
