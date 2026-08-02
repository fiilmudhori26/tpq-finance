# IMPLEMENTATION_PLAN — TPQ Finance (Task-Level)

| | |
|---|---|
| Basis | `docs/ARCHITECTURE.md` (Next.js 15 + Prisma + Supabase + Better Auth), `docs/PRD.md`, `docs/DATABASE.md`, `docs/DESIGN_SYSTEM.md` |
| Aturan task | Tiap task **1–3 jam**, independen, ber-urutan (dependensi ditandai "butuh: Txx") |
| Gate tiap fase | `npm run lint` + `npx tsc --noEmit` + `npm run build` hijau |
| Verifikasi visual | Bandingkan tiap halaman dengan `design/stitch/*/screen.png` |
| Status | Belum ada kode. Semua checkbox kosong. |

Legend: ✅ = selesai · ⬜ = belum · 🚧 = sedang. Semua tugas mulai ⬜.

---

## FASE 0 — Setup Proyek (~4 jam)

### T01 — Scaffold Next.js 15 + deps (~1 jam)
- [ ] `npx create-next-app@latest` di `F:\Portofolio\spp tpq\` (TS, Tailwind, App Router, ESLint, src/)
- [ ] Install: `prisma @prisma/client better-auth zod lucide-react recharts sonner`
- [ ] Init shadcn: `npx shadcn@latest init`; add: `button card input select table badge dialog alert-dialog avatar dropdown-menu tooltip skeleton pagination tabs label textarea sonner`
- [ ] Font Geist via `next/font/google`; `lang="id"`; metadata "TPQ Finance"
- [ ] `.gitignore` + `git init`; commit awal

### T02 — Design tokens Tailwind (~2 jam)
- [ ] `tailwind.config`: token warna M3 dari DESIGN_SYSTEM.md §1 (light + dark), `fontFamily`, `boxShadow.soft` (0 4px 20px rgba(0,0,0,0.03)), `maxWidth.container-max: 1280px`
- [ ] `globals.css`: CSS vars (light), `tabular-nums` untuk angka, scrollbar tipis (custom-scrollbar)
- [ ] `components.json` alias `@/components`, `@/lib`
- [ ] Komponen shadcn di-token-kan (primary → #006948, dll.)
- [ ] **Gate**: build hijau, halaman awal tampil token benar

---

## FASE 1 — Database (Prisma + Supabase) (~8 jam)

### T03 — Prisma schema + Supabase (~2 jam)
- [ ] Buat proyek Supabase (region Asia), ambil `DATABASE_URL` (pooler) + `DIRECT_URL`
- [ ] `schema.prisma` dari DATABASE.md Lampiran A + penyesuaian ARCHITECTURE.md §11 (User: name/password/emailVerified, additionalFields role/tenantId/status)
- [ ] Model Better Auth: `session`, `account`, `verification` (referensi resmi better-auth adapter prisma)
- [ ] `prisma migrate dev --name init` (tanpa CHECK dulu); `prisma generate`

### T04 — CHECK constraints + seed (~2 jam)
- [ ] Migration manual SQL: `CHECK (jumlah > 0)` Transaksi, `CHECK (nominal > 0)` Pembayaran & SppRate, `CHECK (tanggal <= now())` Transaksi
- [ ] `prisma/seed.ts`: 1 Tenant, 1 Super Admin (hash password Better Auth), 8 kategori default (BR-13), SppRate 3 jenjang
- [ ] `package.json` script `db:seed`; `prisma migrate dev` final

### T05 — Prisma Client Extension (~3 jam)
- [ ] `src/lib/db.ts`: client + extension soft-delete (filter `deletedAt: null` di findMany/findFirst/count; `delete`/`deleteMany` → soft update)
- [ ] Extension auto-`tenantId` (inject dari konteks sesi ke create/update)
- [ ] `src/lib/audit.ts`: helper `audit(tx, {...})` (AksiAudit dari DATABASE.md §9)
- [ ] Self-check: script `scripts/check-db.ts` — create→read→soft-delete→read (0 rows), assert lulus, hapus data uji
- [ ] **Gate**: `tsc` hijau, seed jalan, check lulus

---

## FASE 2 — Auth (Better Auth) (~6 jam)

### T06 — Konfigurasi Better Auth (~2 jam)
- [ ] `src/lib/auth.ts`: `betterAuth({ database: prisma, emailAndPassword, session: expiresIn 7d, updateAge 1d, user.additionalFields: tenantId/role/status })`
- [ ] Hook `afterLogin`: update `lastLoginAt` + audit LOGIN (fire-and-forget)
- [ ] Route `/api/auth/[...all]/route.ts` (GET+POST → auth.handler)
- [ ] `src/lib/session.ts`: `getSession()`, `requireRole(...roles)` (cek status AKTIF), `IZIN` map (ARCHITECTURE.md §4)
- [ ] `src/lib/validations.ts`: zod schema login (email, password ≥ 8)

### T07 — Login page + middleware (~2 jam)
- [ ] `src/app/(auth)/login/page.tsx`: card center GlassCard, logo, email+password, error "Email atau password salah." (E1), submit pending
- [ ] `createAuthClient` (`better-auth/react`) untuk tombol login/logout
- [ ] `src/middleware.ts`: cek cookie sesi (`getSessionCookie`) → redirect `/login`; exclude `/login`, `/api/auth/*`
- [ ] Server action `login` + `logout` (`actions/auth.ts`, wrap auth.api)

### T08 — Guard layout + proteksi aksi (~2 jam)
- [ ] `(app)/layout.tsx`: `requireRole` → redirect login; render AppShell
- [ ] Route `/api/export/*`, `/api/bukti/*` stub dengan `requireRole` (403 untuk viewer, E15)
- [ ] Logout di sidebar user menu; audit LOGOUT
- [ ] **Gate**: login/logout jalan, route tertutup, viewer 403, lint+build hijau

---

## FASE 3 — Layout Shell (~6 jam)

### T09 — Sidebar + Navbar (~2 jam)
- [ ] `AppShell`: grid sidebar + navbar + main (`ml-64 p-8 max-w-[1280px] mx-auto`)
- [ ] `Sidebar` + `SidebarItem`: brand (Landmark, "TPQ Finance" + "Bendahara TPQ"), 7 nav (LayoutDashboard, Users, Wallet, CreditCard, ReceiptText, BarChart3, Settings), aktif `bg-secondary-container scale-[0.98]` + ikon filled
- [ ] `UserCard` footer: avatar + nama + role; logout
- [ ] `Navbar`: sticky 64px glass (`bg-surface-bright/70 backdrop-blur-xl`), `SearchBar` pill, Bell + dot error, divider, tanggal hari ini + Calendar

### T10 — Mobile drawer (~2 jam)
- [ ] Sidebar off-canvas (`translate-x` + backdrop) di `<768px`; hamburger Menu/X di navbar
- [ ] `PageHeader` (judul + deskripsi + slot aksi), `Footer`, `MobileFAB` (`md:hidden`)
- [ ] 7 route kosong + redirect `/` → `/beranda`

### T11 — Komponen dasar shadcn-token (~2 jam)
- [ ] `StatCard` (ikon container + chip delta + label uppercase + nilai; hover lift 4px + border hover)
- [ ] `StatCardDark`, `BentoCard` (blob dekoratif), `DataCard`, `GlassCard`, `FilterCard`
- [ ] `StatusBadge` (Lunas/Tunggakan/Proses + dot), `CategoryBadge`, `ClassBadge`, `AvatarInitials`
- [ ] **Gate**: shell responsif (desktop+mobile) di semua 7 route, build hijau

---

## FASE 4 — Tabel & Form Base (~6 jam)

### T12 — DataTable + PaginationBar (~2 jam)
- [ ] `DataTable` generik: config kolom, header uppercase `bg-surface-container-low`, divider `divide-outline-variant/20`, hover row, `overflow-x-auto`, loading (Skeleton) + empty state ("Belum ada data." E16)
- [ ] `PaginationBar`: "Menampilkan X-Y dari Z" + halaman `w-8 h-8 rounded border`, aktif primary
- [ ] `TableRowActions` (hover-only Eye/Pencil / MoreVertical + DropdownMenu)

### T13 — Form base + ModalDialog (~2 jam)
- [ ] `FormField`, `FormInput` (varian surface/white), `FormSelect`, `FormTextarea`, `FormDateInput`, `FileUploadZone` (preview client, validasi tipe/ukuran)
- [ ] `ModalDialog` (Dialog shadcn: overlay `bg-on-surface/40 backdrop-blur-sm`, panel `rounded-2xl max-w-lg`, header + X, body scroll, footer Batal/Simpan; a11y bawaan Radix)
- [ ] `ConfirmDialog` (AlertDialog: "Hapus data ini? Tindakan tidak dapat dibatalkan." E9)
- [ ] `src/lib/format.ts`: `formatRupiah()` (Intl id-ID), `formatTanggal()` (WIB)

### T14 — Server action template (~2 jam)
- [ ] `src/lib/format.ts`… (lihat T13); buat 1 action contoh penuh: `tambahPemasukan` (requireRole → zod → $transaction mutasi+audit → revalidatePath+Tag) sebagai **template** untuk semua action lain (T16+)
- [ ] Pattern `useActionState` + zod: file `actions/transaksi.ts` lengkap, dipakai Fase 6
- [ ] Self-check: submit valid → row masuk; submit invalid → error per-field
- [ ] **Gate**: komponen base terlihat benar di dummy page, build hijau

---

## FASE 5 — Beranda (~6 jam)

### T15 — KPI + grafik (~3 jam)
- [ ] Welcome header: "Assalamu'alaikum, {nama}!" (display-lg primary) + deskripsi
- [ ] 4 `StatCard`: Total Saldo Kas (+chip delta), Pemasukan Bulan Ini (chip "Agustus"), Pengeluaran Bulan Ini (chip -12%), Total Santri Aktif — query agregat Prisma (groupBy jenis, count santri AKTIF)
- [ ] `FinanceBarChart` (Recharts): 6 bulan, 2 Bar (fill #006948 / #565e74, radius [8,8,0,0]), grid `outline-variant/30`, tooltip dark pill custom, select periode (`bg-surface-container-low`), bulan berjalan disorot
- [ ] `unstable_cache` per-tenant + `revalidateTag("dashboard")` (ARCHITECTURE.md §5)

### T16 — Tunggakan + transaksi terbaru (~2 jam)
- [ ] `ArrearsList`: query pembayaran belum dibayar per santri (bulan berjalan ≤ bulan tagihan), avatar inisial + nama + kelas + nominal error + durasi; scroll `max-h-72`; "Lihat Semua" → `/santri?status=tunggakan`
- [ ] `DataTable` "Transaksi Terbaru" (5 terakhir, kolom Tanggal/Deskripsi/Kategori/Jumlah/Status, nominal hijau/-error), link "Lihat Semua Transaksi"
- [ ] `MobileFAB` → `ModalDialog` tambah transaksi (pilih jenis → form pemasukan/pengeluaran)

### T17 — Sinkronisasi dashboard (~1 jam)
- [ ] KPI & grafik update setelah aksi apa pun (revalidateTag dashboard)
- [ ] Saldo negatif → badge peringatan (E18)
- [ ] **Gate**: visual ≈ `beranda_tpq_finance/screen.png`, angka benar vs data seed, build hijau

---

## FASE 6 — Santri (~6 jam)

### T18 — Tabel + filter (~2 jam)
- [ ] Halaman `/santri`: `PageHeader` + "Tambah Santri"; tabel (AvatarInitials + ID, ClassBadge, wali + HP, StatusBadge dot, TableRowActions)
- [ ] `FilterCard` (3 select: jenjang/kelas/status + tombol filter) — query param `?jenjang=&kelas=&status=`
- [ ] Stat hijau `bg-primary-container` (Total Santri Aktif + "+N bulan ini")
- [ ] Pagination server-side (`skip/take` + count; "Menampilkan 1-10 dari 128 santri")
- [ ] Search navbar "Cari santri, wali, atau ID..." → `/santri?q=` (debounce, ILIKE)

### T19 — CRUD santri (~2 jam)
- [ ] `actions/santri.ts`: tambah/edit (zod: nama, jenjang, kelas, wali wajib), hapus, nonaktifkan
- [ ] noInduk otomatis: `{tahun}{urut per tenant}` — generate dalam $transaction (count + 1, retry pada unique conflict)
- [ ] Hapus: jika punya pembayaran → dialog "Nonaktifkan?" (E10, BR-04); else soft delete + audit
- [ ] Toast sukses/gagal (sonner), revalidatePath

### T20 — Profil santri (~2 jam)
- [ ] `/santri/[id]`: detail + ringkasan (Total Lunas/Tunggakan bulan) + link ke `/pembayaran-spp/[id]`
- [ ] 404/empty state "Santri tidak ditemukan." (E13)
- [ ] **Gate**: CRUD + filter + search + pagination jalan, build hijau

---

## FASE 7 — Pembayaran SPP (~6 jam)

### T21 — Halaman SPP + checklist (~3 jam)
- [ ] `/pembayaran-spp/[id]`: layout `lg:grid-cols-4/8`
- [ ] Kiri: GlassCard profil (foto 128px `rounded-3xl border-4`, chip Aktif, stat mini Lunas/Tunggakan) + StatCardDark "Total Harus Dibayar" (rincian per bulan + tombol "Bayar Sekarang" `bg-primary-container`)
- [ ] Kanan: `MonthlyChecklist` 12 bulan (Lunas `bg-primary ring-primary/5` CheckCircle2 / Tunggakan `bg-error-container animate-pulse` AlertCircle / Belum `bg-surface-container-highest` Clock; legenda dot; hover scale) — status dari query pembayaran + SppRate snapshot

### T22 — Catat pembayaran (atomik) (~2 jam)
- [ ] `actions/pembayaran.ts` `catatPembayaranSpp`: $transaction — create Pembayaran (nominal snapshot dari SppRate, bulan = tgl 1, noReferensi `#TRX-{urut}`) + create Transaksi (PEMASUKAN, kategori default "SPP Santri", sumber = nama santri) + audit
- [ ] Unique `(tenantId, santriId, bulan)` → error "Bulan ini sudah dibayar." (EC-03)
- [ ] `useOptimistic` checklist (klik → hijau langsung, rollback on fail); "Bayar Sekarang" → ModalDialog pilih bulan
- [ ] Riwayat tabel (ref, tanggal, bulan, nominal, status, unduh)

### T23 — Kwitansi + cetak (~1 jam)
- [ ] Komponen cetak kwitansi (`print:hidden` shell, `@page` A4); tombol unduh → `window.print()`
- [ ] "Cetak PDF" → route `?print=1` print rekap SPP santri
- [ ] **Gate**: bayar → checklist hijau + riwayat + saldo bertambah + transaksi "SPP Santri" tercatat; build hijau

---

## FASE 8 — Pemasukan & Pengeluaran (~7 jam)

### T24 — Halaman pemasukan (~2 jam)
- [ ] Navbar varian judul "Pemasukan Kas"; 3 StatCard (total + delta %, infaq & sedekah + donatur, % lunas + ProgressStat bar)
- [ ] `ActionBar` (Filter, periode "Agustus 2024", Ekspor, "Tambah Pemasukan")
- [ ] Tabel: CategoryBadge, sumber, nominal `text-primary`, tanggal, catatan italic, MoreVertical; row hover `bg-primary/5`

### T25 — Halaman pengeluaran (~2 jam)
- [ ] 3 `BentoCard` (total bulan ini + delta, kategori terbesar + porsi, sisa anggaran + tenggat) + blob dekoratif
- [ ] Tabel: tanggal+jam stack, CategoryBadge, keterangan `truncate max-w-xs`, `ReceiptThumb` bukti, jumlah, MoreVertical

### T26 — CRUD + upload bukti (~3 jam)
- [ ] `actions/transaksi.ts`: tambah/edit/hapus pemasukan & pengeluaran (satu file, `jenis` param) — template T14
- [ ] Modal form pemasukan (kategori/sumber/jumlah/tanggal/catatan) & pengeluaran (tanggal+ikon calendar, kategori/jumlah, keterangan, FileUploadZone)
- [ ] Upload: action menerima File → validasi tipe/ukuran server → Supabase admin `storage.from("bukti").upload(tenantId/uuid.ext)` → simpan path (dalam $transaction) → preview via `/api/bukti/[id]` signed URL (1 jam)
- [ ] Filter kategori + periode; soft delete + audit; ringkasan ikut update
- [ ] **Gate**: CRUD + bukti + preview jalan, build hijau

---

## FASE 9 — Laporan & Ekspor (~5 jam)

### T27 — Halaman laporan (~2 jam)
- [ ] Grafik pemasukan vs pengeluaran per bulan (reuse FinanceBarChart, periode setahun) + tabel rekap (groupBy bulan)
- [ ] Ringkasan per kategori (groupBy kategoriId + nama) — FR-LAP-02
- [ ] Rekap tunggakan per kelas (FR-LAP-03)
- [ ] Filter periode (bulan/tahun/semester)

### T28 — Ekspor CSV (~2 jam)
- [ ] `lib/export.ts`: build CSV stdlib (escape `"`, `\r\n`, BOM untuk Excel)
- [ ] Route `/api/export/[jenis]`: requireRole(BENDAHARA, SUPER_ADMIN) → query (filter dari query params) → `Content-Disposition: attachment` + stream; audit EXPORT (isi filter)
- [ ] Tombol Ekspor di pemasukan/pengeluaran/laporan → hit route

### T29 — Cetak laporan (~1 jam)
- [ ] Template cetak laporan (`print:hidden`, A4, `break-inside: avoid`) — browser print
- [ ] **Gate**: CSV & PDF terunduh benar, build hijau

---

## FASE 10 — Pengaturan (~4 jam)

### T30 — SPP rate + kategori (~2 jam)
- [ ] `/pengaturan` layout tabs (shadcn Tabs): Profil TPQ / SPP / Kategori
- [ ] `actions/pengaturan.ts`: simpan profil (Pengaturan KV: `profil.namaTpq`, `profil.alamat`), `tahunAjaranAktif`
- [ ] CRUD `SppRate` (per jenjang per tahun ajaran; unique (tenantId, jenjang, tahunAjaran)) — dipakai prefill T22
- [ ] CRUD `Kategori` (isDefault tidak bisa dihapus — C11); dropdown form pakai kategori tenant

### T31 — User management (Super Admin) (~2 jam)
- [ ] Daftar user tenant, tambah (email+nama+role), nonaktifkan, ganti role
- [ ] Guard C12: minimal 1 SUPER_ADMIN, tak bisa nonaktifkan diri sendiri
- [ ] **Gate**: ubah SPP rate → pembayaran baru pakai nominal baru; build hijau

---

## FASE 11 — Polish & Aksesibilitas (~5 jam)

### T32 — A11y + responsive audit (~3 jam)
- [ ] Keyboard: semua dialog fokus-trap + Escape + focus return (Radix bawaan — verifikasi)
- [ ] Label `for`/`id` semua form; error inline `aria-describedby`
- [ ] Kontras token (primary on container dll.) — audit manual
- [ ] Responsive 360/768/1280: sidebar drawer, grid 1/2/4 kolom, tabel scroll-x, modal mobile, FAB
- [ ] Lighthouse ≥ 90 (perf, a11y) — fix temuan

### T33 — Micro-interaction + dark mode (~2 jam)
- [ ] `active:scale-95` global tombol, hover lift kartu, toast sonner
- [ ] Dark mode toggle (class strategy, token dark dari DESIGN_SYSTEM §1; default light)
- [ ] Audit teks: 100% Bahasa Indonesia (EYD), tidak ada string Inggris di UI
- [ ] **Gate**: 5 halaman ≈ screenshot acuan, Lighthouse lulus

---

## FASE 12 — Deploy (~3 jam)

### T34 — Deploy Vercel + Supabase (~3 jam)
- [ ] Repo GitHub `fiilmudhori26/tpq-finance`; push
- [ ] Vercel import; env: `DATABASE_URL` (pooler), `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- [ ] `prisma migrate deploy` di Supabase (production)
- [ ] Seed production (Tenant + Super Admin + kategori)
- [ ] Verify: login, CRUD santri, bayar SPP, upload bukti, ekspor CSV di production
- [ ] Supabase Storage bucket `bukti` (private) + CORS/RLS storage policy
- [ ] **Gate**: https live, alur inti (login → bayar SPP → laporan) jalan di production

---

## Ringkasan

| Fase | Task | Jam |
|---|---|---|
| 0 Setup | T01–T02 | 4 |
| 1 Database | T03–T05 | 8 |
| 2 Auth | T06–T08 | 6 |
| 3 Layout | T09–T11 | 6 |
| 4 Tabel & Form | T12–T14 | 6 |
| 5 Beranda | T15–T17 | 6 |
| 6 Santri | T18–T20 | 6 |
| 7 SPP | T21–T23 | 6 |
| 8 Kas | T24–T26 | 7 |
| 9 Laporan | T27–T29 | 5 |
| 10 Pengaturan | T30–T31 | 4 |
| 11 Polish | T32–T33 | 5 |
| 12 Deploy | T34 | 3 |
| **Total** | **34 task** | **±72 jam** |

Dependensi kritis: T14 (template action) sebelum T16/T22/T26; T22 butuh T30 (SppRate) untuk nominal — kerjakan T30 sebelum T22 bila mengejar jalur SPP dulu. Task paralel: T18–T20 (santri) dengan T24–T26 (kas) setelah T14.
