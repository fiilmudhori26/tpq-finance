"use client";

import Link from "next/link";

export default function PaginationBar({
  total,
  page,
  perPage,
  basePath,
}: {
  total: number;
  page: number;
  perPage: number;
  basePath: string;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const dari = total === 0 ? 0 : (page - 1) * perPage + 1;
  const sampai = Math.min(page * perPage, total);

  const no = (n: number) =>
    n === page ? (
      <span className="flex h-8 w-8 items-center justify-center rounded border border-primary bg-primary text-sm font-bold text-white">
        {n}
      </span>
    ) : (
      <Link
        href={`${basePath}?page=${n}`}
        className="flex h-8 w-8 items-center justify-center rounded border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container"
      >
        {n}
      </Link>
    );

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/20 bg-surface-container-low px-6 py-4 text-sm text-on-surface-variant">
      <p>
        Menampilkan {dari}-{sampai} dari {total} santri
      </p>
      <nav className="flex items-center gap-1.5" aria-label="Paginasi">
        {Array.from({ length: pages }, (_, i) => no(i + 1))}
      </nav>
    </div>
  );
}
