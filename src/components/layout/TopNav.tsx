import { cn } from "@/lib/cn";
import type { ViewId } from "@/types/game";

type NavItem = {
  id: ViewId;
  label: string;
  hint: string;
};

type TopNavProps = {
  activeView: ViewId;
  items: NavItem[];
  onSelect: (view: ViewId) => void;
};

export function TopNav({ activeView, items, onSelect }: TopNavProps) {
  return (
    <nav className="flex flex-wrap gap-3" aria-label="Primary">
      {items.map((item) => {
        const active = item.id === activeView;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "min-w-[136px] rounded-[24px] border px-4 py-3 text-left transition",
              active
                ? "border-transparent bg-[var(--bg-panel-strong)] text-[var(--ink-strong)] shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
                : "border-white/10 bg-white/5 text-stone-200 hover:bg-white/10",
            )}
          >
            <span className="block text-sm font-semibold">{item.label}</span>
            <span className={cn("mt-1 block text-xs", active ? "text-[var(--ink-soft)]" : "text-stone-400")}>
              {item.hint}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
