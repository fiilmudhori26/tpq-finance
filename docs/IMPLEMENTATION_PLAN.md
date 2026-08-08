# IMPLEMENTATION_PLAN — TPQ Finance (Task-Level)

| | |
|---|---|
| Basis | `docs/ARCHITECTURE.md` (Next.js 15 + Prisma + Supabase + Better Auth), `docs/PRD.md`, `docs/DATABASE.md`, `docs/DESIGN_SYSTEM.md` |
| Aturan task | Tiap task **1–3 jam**, independen, ber-urutan (dependensi ditandai "butuh: Txx") |
| Gate tiap fase | `npm run lint` + `npx tsc --noEmit` + `npm run build` hijau |
| Verifikasi visual | Bandingkan tiap halaman dengan `design/stitch/*/screen.png` |
| Status | Fase 0 - Fase 10 selesai dan telah terintegrasi dengan Server Actions atomik. |

Legend: ✅ = selesai · ⬜ = belum · 🚧 = sedang.

---

## FASE 0 — Setup Proyek (~4 jam)

### T01 — Scaffold Next.js 15 + deps (~1 jam)
- [x] `npx create-next-app@latest` (TS, Tailwind, App Router, ESLint, src/)
- [x] Install: `prisma @prisma/client better-auth zod lucide-react recharts sonner`
- [x] Init shadcn components
- [x] Font Geist; `lang="id"`; metadata "TPQ Finance"
- [x] `.gitignore` + `git init`; commit awal

### T02 — Design tokens Tailwind (~2 jam)
- [x] `tailwind.config`: token warna M3 dari DESIGN_SYSTEM.md §1
- [x] `globals.css`: CSS vars (light), `tabular-nums` untuk angka, custom scrollbar
- [x] `components.json` alias `@/components`, `@/lib`
- [x] **Gate**: build hijau, halaman awal tampil token benar

---

## FASE 1 — Database (Prisma + Supabase) (~8 jam)

### T03 — Prisma schema + Supabase (~2 jam)
- [x] `schema.prisma` dari DATABASE.md + penyesuaian Better Auth
- [x] Model Better Auth: `session`, `account`, `verification`
- [x] Prisma client generate

### T04 — CHECK constraints + seed (~2 jam)
- [x] `prisma/seed.ts`: 1 Tenant, Super Admin, 8 kategori default, SppRate jenjang
- [x] Script seed & migration final

### T05 — Prisma Client Extension (~3 jam)
- [x] `src/lib/db.ts`: client + extension soft-delete
- [x] Extension auto-`tenantId` dari sesi
- [x] `src/lib/audit.ts`: helper `audit(tx, {...})`

---

## FASE 2 — Auth (Better Auth) (~6 jam)

### T06 — Konfigurasi Better Auth (~2 jam)
- [x] `src/lib/auth.ts`: Better Auth handler
- [x] `src/lib/session.ts`: `getSession()`, `requireRole(...roles)`
- [x] `src/lib/validations.ts`: Zod schema

### T07 — Login page + middleware (~2 jam)
- [x] `src/app/(auth)/login/page.tsx`
- [x] `src/middleware.ts`: proteksi route
- [x] Server action auth (`actions/auth.ts`)

### T08 — Guard layout + proteksi aksi (~2 jam)
- [x] `(app)/layout.tsx`: `requireRole` & AppShell guard

---

## FASE 3 — Layout Shell (~6 jam)

### T09 — Sidebar + Navbar (~2 jam)
- [x] `AppShell`, `Sidebar`, `Navbar`
- [x] `UserCard` footer & brand

### T10 — Mobile drawer (~2 jam)
- [x] Sidebar off-canvas mobile
- [x] Redirect `/` -> `/beranda`

### T11 — Komponen dasar shadcn-token (~2 jam)
- [x] `StatCard`, `BentoCard`, `GlassCard`
- [x] `StatusBadge`, `ClassBadge`, `AvatarInitials`

---

## FASE 4 — Tabel & Form Base (~6 jam)

### T12 — DataTable + PaginationBar (~2 jam)
- [x] `DataTable` generik & `PaginationBar`

### T13 — Form base + ModalDialog (~2 jam)
- [x] `ModalDialog` & `src/lib/format.ts` (`formatRupiah`)

### T14 — Server action template (~2 jam)
- [x] Pattern `requireRole` -> Zod -> `$transaction` (mutasi + audit log) -> `revalidatePath`

---

## FASE 5 — Beranda (~6 jam)

### T15 — KPI + grafik (~3 jam)
- [x] `src/actions/beranda.ts`: `getDashboardKpi`, `getTrend6Bulan`
- [x] `FinanceBarChart` (Recharts)

### T16 — Tunggakan + transaksi terbaru (~2 jam)
- [x] `ArrearsList` & `TransaksiTerbaru`

### T17 — Sinkronisasi dashboard (~1 jam)
- [x] Revalidation tag `dashboard`

---

## FASE 6 — Santri (~6 jam)

### T18 — Tabel + filter (~2 jam)
- [x] Halaman `/santri` & `FilterCard`

### T19 — CRUD santri (~2 jam)
- [x] `src/actions/santri.ts`: `tambahSantri`, `editSantri`, `hapusSantri`
- [x] `noInduk` otomatis `{tahun}{urut}`
- [x] Audit log & soft status/delete

### T20 — Profil santri (~2 jam)
- [x] `/santri/[id]` detail & ringkasan

---

## FASE 7 — Pembayaran SPP (~6 jam)

### T21 — Halaman SPP + checklist (~3 jam)
- [x] `/pembayaran-spp` & checklist bulanan

### T22 — Catat pembayaran (atomik) (~2 jam)
- [x] `src/actions/pembayaran.ts`: `catatPembayaranSpp` dalam `$transaction` (Pembayaran + Transaksi PEMASUKAN + audit)

### T23 — Kwitansi + cetak (~1 jam)
- [x] Komponen kwitansi cetak

---

## FASE 8 — Pemasukan & Pengeluaran (~7 jam)

### T24 — Halaman pemasukan (~2 jam)
- [x] Halaman `/pemasukan` & `ModalPemasukan`

### T25 — Halaman pengeluaran (~2 jam)
- [x] Halaman `/pengeluaran` & `ModalPengeluaran`

### T26 — CRUD + upload bukti (~3 jam)
- [x] `src/actions/transaksi.ts`: `tambahTransaksi`, `editTransaksi`, `hapusTransaksi`

---

## FASE 9 — Laporan & Ekspor (~5 jam)

### T27 — Halaman laporan (~2 jam)
- [x] Halaman `/laporan` & rekap data DB

### T28 — Ekspor CSV (~2 jam)
- [x] Export helper CSV

---

## FASE 10 — Pengaturan (~4 jam)

### T30 — SPP rate + kategori (~2 jam)
- [x] `src/actions/pengaturan.ts`: `simpanProfilTpq`, `simpanSppRate`, `tambahKategori`, `hapusKategori`
