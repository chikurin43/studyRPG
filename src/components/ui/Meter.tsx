import { cn } from "@/lib/cn";

type MeterProps = {
  value: number;
  max: number;
  tone?: "moss" | "ember" | "sky";
  className?: string;
};

const toneClasses = {
  moss: "from-[var(--accent-moss)] to-[#86a076]",
  ember: "from-[var(--accent-ember)] to-[#e69d72]",
  sky: "from-[var(--accent-sky)] to-[#6f96a9]",
};

export function Meter({ value, max, tone = "moss", className }: MeterProps) {
  const progress = max <= 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("h-3 overflow-hidden rounded-full bg-stone-900/10", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", toneClasses[tone])}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
