import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  title?: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Panel({ title, eyebrow, description, actions, children, className }: PanelProps) {
  return (
    <section
      className={cn(
        "panel-texture rounded-[28px] border border-[var(--line-soft)] bg-[var(--bg-panel)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur",
        className,
      )}
    >
      {(title || description || actions) && (
        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--ink-soft)]">
                {eyebrow}
              </p>
            ) : null}
            {title ? <h2 className="text-2xl font-semibold text-[var(--ink-strong)]">{title}</h2> : null}
            {description ? <p className="text-sm leading-6 text-[var(--ink-soft)]">{description}</p> : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </header>
      )}
      {children}
    </section>
  );
}
