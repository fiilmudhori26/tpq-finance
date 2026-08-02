import type { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
