import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Kpi } from "@/lib/format";

const IKON: Record<string, LucideIcon> = {
  wallet: Wallet,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  users: Users,
};

const CHIP_TONE: Record<string, string> = {
  positive: "bg-primary/10 text-primary",
  negative: "bg-error/10 text-error",
  neutral: "bg-secondary/10 text-secondary",
};

export default function StatCard({ kpi }: { kpi: Kpi }) {
  const Icon = IKON[kpi.icon] ?? Wallet;
  return (
    <article
      className={`group rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft transition-all hover:-translate-y-1 md:p-8 ${
        kpi.hoverBorder ?? "hover:border-primary/30"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${kpi.iconBg} ${kpi.iconColor}`}
        >
          <Icon className="h-6 w-6" aria-hidden />
        </div>
        {kpi.chip && (
          <span
            className={`rounded-full px-2 py-1 text-xs font-bold ${
              CHIP_TONE[kpi.chipTone ?? "neutral"]
            }`}
          >
            {kpi.chip}
          </span>
        )}
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        {kpi.label}
      </p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-on-surface">
        {kpi.nilai}
        {kpi.sub && (
          <span className="ml-1 text-base font-normal text-on-surface-variant">
            {kpi.sub}
          </span>
        )}
      </p>
    </article>
  );
}
