"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Menu, Search, Calendar } from "lucide-react";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const hariIni = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-outline-variant bg-surface-bright/70 px-4 backdrop-blur-xl md:px-8">
      <button
        type="button"
        aria-label="Buka menu"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              router.push(`/santri?q=${encodeURIComponent(query.trim())}`);
            }
          }}
          placeholder="Cari santri, wali, atau ID..."
          aria-label="Pencarian"
          className="w-full rounded-full border-none bg-surface-container-low py-2 pl-10 pr-4 text-sm text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        </button>
        <div className="h-8 w-px bg-outline-variant" aria-hidden />
        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Calendar className="h-4 w-4" aria-hidden />
          <span className="hidden lg:block">{hariIni}</span>
          <span className="lg:hidden">
            {new Intl.DateTimeFormat("id-ID", {
              day: "numeric",
              month: "short",
            }).format(new Date())}
          </span>
        </div>
      </div>
    </header>
  );
}
