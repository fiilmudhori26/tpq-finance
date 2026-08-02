"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ReceiptText,
  BarChart3,
  Settings,
  Landmark,
  LogOut,
} from "lucide-react";

const NAV = [
  { href: "/beranda", label: "Beranda", icon: LayoutDashboard },
  { href: "/santri", label: "Santri", icon: Users },
  { href: "/pembayaran-spp", label: "Pembayaran SPP", icon: CreditCard },
  { href: "/pemasukan", label: "Pemasukan", icon: Wallet },
  { href: "/pengeluaran", label: "Pengeluaran", icon: ReceiptText },
  { href: "/laporan", label: "Laporan", icon: BarChart3 },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const content = (
    <>
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-white">
          <Landmark className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-bold text-primary">TPQ Finance</p>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            Bendahara TPQ
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-1" aria-label="Navigasi utama">
        {NAV.map(({ href, label, icon: Icon }) => {
          const aktif =
            pathname === href || (href !== "/beranda" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              aria-current={aktif ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                aktif
                  ? "scale-[0.98] bg-secondary-container font-bold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <Icon className={`h-5 w-5 ${aktif ? "fill-current" : ""}`} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-outline-variant pt-4">
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-sm font-bold text-secondary">
            BA
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-on-surface">Bendahara</p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              Admin
            </p>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-high"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-outline-variant bg-surface p-4 md:flex">
        {content}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-outline-variant bg-surface p-4">
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
