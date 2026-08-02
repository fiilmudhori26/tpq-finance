import { Users } from "lucide-react";

const AVATAR_BG = [
  "bg-secondary-container",
  "bg-primary-fixed-dim",
  "bg-secondary",
  "bg-primary-container",
];

export default function AvatarInitials({
  nama,
  size = "md",
  variant = 0,
}: {
  nama: string;
  size?: "sm" | "md" | "lg";
  variant?: number;
}) {
  const inisial = nama
    .split(" ")
    .slice(0, 2)
    .map((k) => k[0] ?? "")
    .join("")
    .toUpperCase();
  const s = size === "sm" ? "h-8 w-8 text-xs" : size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm";
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-bold ${s} ${
        AVATAR_BG[variant % AVATAR_BG.length]
      }`}
      aria-hidden
    >
      {inisial}
    </span>
  );
}

export function AvatarGroup({ count }: { count: number }) {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
      <Users className="h-4 w-4" aria-hidden />
      {count}
    </div>
  );
}
