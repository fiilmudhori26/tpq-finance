"use client";

import { Calendar, FileDown, Filter, Plus } from "lucide-react";

export default function ActionBar({
  title,
  periode,
  onAdd,
  addLabel,
}: {
  title: string;
  periode: string;
  onAdd: () => void;
  addLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
        >
          <Filter className="h-4 w-4" aria-hidden /> Filter
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-outline-variant bg-white px-4 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container"
        >
          <Calendar className="h-4 w-4" aria-hidden /> {periode}
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5"
        >
          <FileDown className="h-4 w-4" aria-hidden /> Ekspor
        </button>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-on-primary transition-opacity hover:opacity-90 active:scale-95"
        >
          <Plus className="h-4 w-4" aria-hidden /> {addLabel}
        </button>
      </div>
      <span className="sr-only">{title}</span>
    </div>
  );
}
