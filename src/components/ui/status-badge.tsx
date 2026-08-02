const TONE: Record<string, string> = {
  Lunas: "bg-green-100 text-green-700",
  Tunggakan: "bg-red-100 text-red-700",
  Proses: "bg-yellow-100 text-yellow-700",
};

const DOT: Record<string, string> = {
  Lunas: "bg-green-500",
  Tunggakan: "bg-red-500",
  Proses: "bg-yellow-500",
};

export default function StatusBadge({
  status,
  dot = false,
}: {
  status: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
        TONE[status] ?? "bg-surface-container text-on-surface-variant"
      }`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${DOT[status] ?? "bg-current"}`} aria-hidden />}
      {status}
    </span>
  );
}
