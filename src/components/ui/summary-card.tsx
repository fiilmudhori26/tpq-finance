import type { LucideIcon } from "lucide-react";

export default function SummaryCard({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
  chip,
  chipTone = "neutral",
  progress,
}: {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
  chip?: string;
  chipTone?: "positive" | "negative" | "neutral";
  progress?: number;
}) {
  const chipClass =
    chipTone === "positive"
      ? "bg-primary/5 text-primary"
      : chipTone === "negative"
        ? "bg-error/5 text-error"
        : "bg-secondary/5 text-secondary";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        {chip && (
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${chipClass}`}>
            {chip}
          </span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-on-surface md:text-3xl">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-on-surface-variant">{sub}</p>}
      {progress !== undefined && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
          <div
            className="h-full rounded-full bg-tertiary transition-all"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}
    </div>
  );
}
