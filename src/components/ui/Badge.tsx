import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "moss" | "ember" | "sky";
  className?: string;
};

const toneClasses = {
  neutral: "bg-stone-900/5 text-[var(--ink-soft)] border-stone-900/10",
  moss: "bg-[rgba(89,115,79,0.12)] text-[var(--accent-moss)] border-[rgba(89,115,79,0.24)]",
  ember: "bg-[rgba(201,106,61,0.12)] text-[var(--accent-ember)] border-[rgba(201,106,61,0.24)]",
  sky: "bg-[rgba(61,102,125,0.12)] text-[var(--accent-sky)] border-[rgba(61,102,125,0.24)]",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
