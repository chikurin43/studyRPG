import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[var(--accent-moss)] text-stone-50 shadow-[0_10px_30px_rgba(89,115,79,0.24)] hover:bg-[#496442]",
  secondary:
    "bg-[var(--accent-sky)] text-stone-50 shadow-[0_10px_30px_rgba(61,102,125,0.22)] hover:bg-[#315264]",
  ghost:
    "border border-[var(--line-strong)] bg-white/55 text-[var(--ink-strong)] hover:bg-white/80",
  danger:
    "bg-[var(--danger)] text-stone-50 shadow-[0_10px_30px_rgba(166,68,50,0.24)] hover:bg-[#8d3628]",
};

const sizeClasses: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-10 px-3 text-sm",
  md: "h-11 px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
