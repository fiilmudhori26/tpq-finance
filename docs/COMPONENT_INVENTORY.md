# COMPONENT_INVENTORY — TPQ Finance

Daftar komponen reusable. Semua berbasis shadcn/ui (Radix) + Lucide, di-token-kan sesuai DESIGN_SYSTEM.md. Hirarki: **layout → komponen dasar → komposit → halaman**.

---

## A. Layout (app shell)

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 1 | `AppShell` | Wrapper: sidebar + navbar + main (`ml-64`, `p-8`, `max-w-[1280px] mx-auto`). Layout desktop fixed sidebar, mobile drawer. | custom |
| 2 | `Sidebar` | 256px, brand logo + 7 item nav + user footer. Item aktif `bg-secondary-container scale-[0.98]`. Mobile: off-canvas drawer + backdrop. | custom |
| 3 | `Navbar` | Sticky 64px glass (`bg-surface-bright/70 backdrop-blur-xl`), search pill kiri, notifikasi + tanggal/user kanan. Mobile: hamburger. | custom |
| 4 | `SidebarItem` | Item nav reusable: ikon Lucide, label, state aktif/inaktif, hover `bg-surface-container-high`. | custom |
| 5 | `UserCard` | Avatar (foto/inisial) + nama + role. Dua varian: footer sidebar, versi card `bg-surface-container-low` (pembayaran SPP). | custom |
| 6 | `PageHeader` | Judul halaman (`headline-md`) + deskripsi + slot aksi kanan (tombol Tambah/Cetak). | custom |
| 7 | `MobileFAB` | `fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-2xl shadow-2xl md:hidden` — tambah cepat (beranda). | custom |
| 8 | `Footer` | Teks copyright center kecil (`text-on-surface-variant/40`). | custom |

## B. Komponen dasar (data display)

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 9 | `StatCard` | Kartu KPI: ikon container berwarna + chip delta + label uppercase + nilai besar. Hover lift 4px, `soft-bloom`, border `outline-variant/30`, hover `border-primary/30`. Props: `icon, iconBg, chip, chipTone, label, value, suffix?`. | Card custom |
| 10 | `StatCardDark` | Kartu inverse-surface: judul + nominal besar + rincian item + tombol aksi. Watermark ikon `opacity-10 text-[160px]`. | Card custom |
| 11 | `BentoCard` | Kartu bento pengeluaran: label + nilai + footer metric + blob dekoratif `bg-<warna>/5 rounded-full` animasi scale hover. | Card custom |
| 12 | `DataCard` | Wrapper kartu putih umum: `rounded-2xl/3xl soft-bloom overflow-hidden`, header (judul + subjudul + slot aksi), body. | Card custom |
| 13 | `GlassCard` | `bg-white/80 backdrop-blur-xl border-white/30 rounded-3xl` — profil santri, checklist, riwayat. | Card custom |
| 14 | `FilterCard` | `bg-white rounded-3xl soft-bloom p-6 flex flex-wrap gap-4` — group filter (select + tombol filter). | Card custom |

## C. Tabel

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 15 | `DataTable` | Tabel generik: header uppercase `bg-surface-container-low`, divider horizontal, hover row, `overflow-x-auto`. Props: `columns, data, loading, empty`. | Table custom |
| 16 | `TableHeader` | Baris header: `font-label-sm text-on-surface-variant uppercase tracking-wider px-6-8 py-4`. | Table custom |
| 17 | `TableRowActions` | Group aksi hover-only (`opacity-0 group-hover:opacity-100`): Eye + Pencil (santri) / MoreVertical (transaksi). | custom |
| 18 | `PaginationBar` | Footer tabel: "Menampilkan X-Y dari Z" + tombol halaman `w-8 h-8 rounded border`, aktif primary, chevron prev/next, disabled state. | Pagination custom |
| 19 | `CategoryBadge` | Badge kategori transaksi: tone primary/sekunder/tersier per kategori (SPP Santri, Donasi, Operasional, Gaji/Honor, dll.). | Badge custom |
| 20 | `StatusBadge` | Badge status: Lunas (green), Tunggakan (red), Proses (yellow). Varian dengan dot `w-1.5 h-1.5 rounded-full`. | Badge custom |
| 21 | `ClassBadge` | Badge jenjang kelas: `bg-tertiary-fixed text-on-tertiary-fixed` ("TKA - Alif"). | Badge custom |
| 22 | `AvatarInitials` | Avatar inisial 40px: bg bervariasi (`secondary-container`, `primary-fixed-dim`, `secondary`, `primary-container`), font-bold, inisial nama. | Avatar custom |

## D. Form & interaksi

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 23 | `FormField` | Label atas + control: `font-label-sm text-on-surface-variant mb-1/space-y-2`. | custom |
| 24 | `FormSelect` | Select: `border-outline-variant rounded-lg px-4 py-3`, focus `ring-primary`, `appearance-none`. | Select custom |
| 25 | `FormInput` | Input: `border-outline-variant rounded-lg px-4 py-3`, focus `ring-2 ring-primary`, `border-primary`. Varian: `surface` (bg-surface-bright, modal pemasukan), `white` (modal pengeluaran). | Input custom |
| 26 | `FormTextarea` | Textarea `rounded-lg rows=3 resize-none`. | Textarea custom |
| 27 | `FormDateInput` | `<input type="date">` native dengan ikon calendar (pengeluaran: `pl-12` + ikon). | Input custom |
| 28 | `SearchBar` | Pill: `rounded-full bg-surface-container-low pl-10 pr-4 py-2` + ikon Search, focus `ring-2 ring-primary/20`. Placeholder per konteks. | custom |
| 29 | `FileUploadZone` | Dropzone: `border-2 border-dashed rounded-2xl p-8 text-center`, hover `border-primary bg-primary/5`, ikon UploadCloud, hint format/ukuran. | custom |
| 30 | `ActionBar` | Baris aksi atas tabel: kiri (Filter, periode), kanan (Ekspor, Tambah). Responsive stack. | custom |
| 31 | `ModalDialog` | Wrapper modal: overlay `bg-on-surface/40 backdrop-blur-sm`, panel `rounded-2xl/3xl shadow-2xl max-w-lg`, header judul + X, body scroll `max-h-[90vh]`, footer aksi (Batal `flex-1` + Simpan `flex-[2]`). Aksesibilitas lengkap. | Dialog custom |
| 32 | `ModalFooter` | Footer modal `bg-surface-container-low flex gap-4`. | custom |

## E. Chart & visualisasi

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 33 | `FinanceBarChart` | Bar chart 6 bulan 2 seri (Pemasukan primary / Pengeluaran secondary), grid horizontal tipis, tooltip dark pill, bulan berjalan disorot. | Recharts custom |
| 34 | `ChartTooltip` | Tooltip custom: `bg-inverse-surface text-inverse-on-surface text-[10px] rounded-lg` ("Rp 8.200.000 (In)"). | Recharts custom |
| 35 | `ProgressStat` | Label + nilai + progress bar `h-2 bg-surface-container rounded-full` fill `bg-primary` (92%). | Progress custom |
| 36 | `LegendDot` | Dot legenda `w-3 h-3 rounded-full` + label (Lunas/Belum). | custom |

## F. Fitur khusus

| # | Komponen | Deskripsi | Status shadcn |
|---|---|---|---|
| 37 | `MonthlyChecklist` | Grid 12 bulan SPP: kartu bulan `rounded-2xl p-4 text-center` — Lunas `bg-primary text-white ring-4 ring-primary/5` + CheckCircle2; Tunggakan `bg-error-container text-error border-error/20 animate-pulse` + AlertCircle; Belum `bg-surface-container-highest` + Clock. Hover scale 105% (kecuali primary). | custom |
| 38 | `ArrearsList` | Daftar tunggakan beranda: avatar inisial + nama + kelas + nominal error + durasi bulan; scroll `max-h-72`, hover `bg-surface-container-low`. | custom |
| 39 | `TransactionRow` | Baris transaksi beranda: ikon kategori `w-8 h-8 rounded-lg bg-<warna>/10` + deskripsi bold + badge kategori + nominal (hijau/-red) + status. | Table custom |
| 40 | `ReceiptThumb` | Thumbnail bukti 48px `rounded-lg border`, hover `ring-2 ring-primary`, klik → preview (modal). | custom |
| 41 | `MonthPicker` | Select periode: `bg-surface-container-low rounded-lg text-label-sm font-bold px-4 py-2` (chart) / tombol outline "Agustus 2024". | Select custom |
| 42 | `EmptyState` | Pesan kosong tabel: ikon + teks "Belum ada data". | custom |
| 43 | `SkeletonRows` | Loading state tabel (shimmer). | Skeleton custom |
| 44 | `ConfirmDialog` | Konfirmasi hapus ("Hapus data ini?") — dibutuhkan untuk aksi destruktif edit/hapus. | AlertDialog custom |
| 45 | `Toast` | Notifikasi aksi (tersimpan, terhapus, error). | Sonner custom |

## Ringkasan

- **Custom murni (layout & komposit):** 1-8, 14, 17, 28, 30, 33-39, 41-42 → ~20 komponen.
- **shadcn/ui + tokenisasi:** 9-13, 15-16, 18-27, 29, 31-32, 40, 43-45 → ~25 komponen.
- Total: **±45 komponen reusable**, tanpa menghitung halaman.
