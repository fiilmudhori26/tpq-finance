"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CreditCard,
  ReceiptText,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  BENDAHARA: "Bendahara",
  VIEWER: "Viewer",
};

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
  const router = useRouter();
  const { data: session } = authClient.useSession();
  // additionalFields (tenantId/role/status) ada di sesi, tak diverifikasi tipe client
  const user = session?.user as
    | { name?: string; role?: string; tenantId?: string; status?: string }
    | undefined;
  const inisial = user?.name
    ? user.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()
    : "BA";

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  const content = (
    <>
      <div className="flex items-center gap-3 px-2 pt-2">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-primary-container">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-tpq.jpg" alt="Logo" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-base font-bold text-primary">TPQ Darul Qur&apos;an</p>
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
            {inisial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-on-surface">
              {user?.name ?? "Bendahara"}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
              {user?.role ? ROLE_LABEL[user.role] ?? user.role : "Bendahara"}
            </p>
          </div>
          <button
            type="button"
            aria-label="Keluar"
            onClick={handleLogout}
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
