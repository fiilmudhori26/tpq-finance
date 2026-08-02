"use client";

import { useState } from "react";
import { Eye, MoreVertical, Pencil, Trash2 } from "lucide-react";

export default function TableRowMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-label="Menu aksi"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Tutup menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-20 w-40 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-1 shadow-lift">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container"
            >
              <Eye className="h-4 w-4" aria-hidden /> Lihat
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container"
            >
              <Pencil className="h-4 w-4" aria-hidden /> Edit
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error-container"
            >
              <Trash2 className="h-4 w-4" aria-hidden /> Hapus
            </button>
          </div>
        </>
      )}
    </div>
  );
}
