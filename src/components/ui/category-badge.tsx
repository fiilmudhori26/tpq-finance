const TONE: Record<string, string> = {
  "SPP Santri": "bg-primary/10 text-primary",
  Donasi: "bg-secondary-container text-secondary",
  "Sewa Aset": "bg-tertiary-fixed text-on-tertiary-fixed",
  Infaq: "bg-secondary-container text-secondary",
  Operasional: "bg-secondary-container text-secondary",
  "Gaji/Honor": "bg-tertiary-fixed text-on-tertiary-fixed",
  Perawatan: "bg-surface-container text-on-surface-variant",
  "Lain-lain": "bg-surface-container text-on-surface-variant",
};

export default function CategoryBadge({ kategori }: { kategori: string }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        TONE[kategori] ?? "bg-surface-container text-on-surface-variant"
      }`}
    >
      {kategori}
    </span>
  );
}
