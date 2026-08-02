# PAGE_SPECIFICATIONS — TPQ Finance

5 halaman acuan + 2 halaman pendukung (login, pengaturan/laporan — disebut di nav, belum ada desain; spesifikasi mengikuti pola sistem).

Shell umum semua halaman (dari manajemen_santri sebagai pola utama):
- `AppShell` → `Sidebar` (7 nav, aktif sesuai halaman) + `Navbar` (search pill + notifikasi + tanggal/user) + `main` (`ml-64 p-8 max-w-[1280px] mx-auto`).
- Semua teks Bahasa Indonesia. Nominal format Rupiah. Font Geist tabular-nums.

---

## 1. Beranda (Dashboard)

**File acuan:** `beranda_tpq_finance/code.html` — paling kompleks, bento grid.

### Struktur
1. **Welcome header** — "Assalamu'alaikum, Aisyah!" (`display-lg` primary) + deskripsi "Berikut adalah ringkasan keuangan TPQ hari ini." (`body-lg` variant).
2. **KPI Bento Grid** — `grid-cols-1 md:2 lg:4 gap-6`:
   - **Saldo Kas** — ikon `account_balance_wallet` (container `bg-primary-fixed-dim/20 text-primary rounded-xl`), chip `+2.4%` (primary/10), label "Total Saldo Kas", nilai "Rp 25.450.000".
   - **Pemasukan Bulan Ini** — ikon `trending_up` (`bg-secondary-fixed-dim/20 text-secondary`), chip "Agustus", nilai "Rp 8.200.000".
   - **Pengeluaran Bulan Ini** — ikon `trending_down` (`bg-error-container/20 text-error`), chip `-12%` (error/10), nilai "Rp 3.500.000".
   - **Total Santri Aktif** — ikon `group` (`bg-tertiary-fixed-dim/20 text-tertiary`), nilai "120 Santri" (unit `body-md` variant).
   - Hover: kartu terangkat 4px + border `hover:border-primary/30` (kartu pengeluaran: `hover:border-error/30`).
3. **Middle section** — `grid lg:grid-cols-3 gap-8`:
   - **Tren Keuangan** (col-span-2): judul + subjudul "Pemasukan vs Pengeluaran 6 Bulan Terakhir" + select periode. Bar chart 6 bulan (Mar–Agu): seri Pemasukan `bg-primary`, Pengeluaran `bg-secondary`, grid 4 garis horizontal, tooltip dark pill hover, bulan berjalan (Agu) `bg-primary-container` + label bold. → `FinanceBarChart` (Recharts).
   - **Tunggakan SPP**: judul + ikon `warning` error; daftar 3+ santri (avatar inisial, nama bold, kelas, nominal error "Rp 150k", durasi "3 Bulan" uppercase 10px); scroll `max-h-72`; tombol "Lihat Semua" (`bg-secondary-container rounded-xl w-full py-3`).
4. **Transaksi Terbaru** — `DataCard` + `DataTable`:
   - Kolom: Tanggal | Deskripsi | Kategori | Jumlah (right) | Status (center).
   - Deskripsi: ikon kategori 32px (`bg-primary/10` / `bg-secondary/10` + ikon: `school`, `electric_bolt`, `volunteer_activism`, `menu_book`) + teks bold.
   - Jumlah: masuk `text-primary font-bold`, keluar `-Rp` `text-error font-bold`.
   - Status: Lunas (green-100), Proses (yellow-100).
   - Header card: judul + subjudul + tombol **"Tambah Transaksi"** (primary, `add`).
   - Footer: link "Lihat Semua Transaksi" (primary + `arrow_forward`).
5. **Footer** — "© 2024 TPQ Finance Ecosystem • Modern Financial Management for Islamic Institutions" (center, variant/40). Ganti teks jadi Bahasa Indonesia: "© 2024 TPQ Finance • Sistem Keuangan Amanah untuk Lembaga Islami".

### Fungsi
- KPI dari agregasi saldo/pemasukan/pengeluaran/santri (data API).
- Chart: data 6 bulan, filter periode.
- Tunggakan: daftar santri menunggak (sort nominal/durasi).
- Tabel: 5 transaksi terakhir, link ke halaman transaksi.
- FAB mobile (`md:hidden`): buka modal tambah transaksi.

---

## 2. Manajemen Santri

**File acuan:** `manajemen_santri_tpq_finance/code.html`

### Struktur
1. **PageHeader** — "Data Master Santri" + "Kelola data seluruh santri TPQ Al-Hidayah secara terpusat." + tombol **"Tambah Santri"** (`person_add` → UserPlus).
2. **Filter & Stats Bento** — `grid grid-cols-12 gap-6 mb-8`:
   - **FilterCard** (col-span-8): 3 select — Jenjang Pendidikan (Semua/TKA Paud/TPA SD/TQA SMP-SMA), Kelas (Semua/Alif/Ba/Ta), Status Pembayaran (Semua/Lunas/Tunggakan); tombol filter ikon `filter_list` (`bg-surface-container-high text-primary hover:bg-primary hover:text-white`).
   - **Stat hijau** (col-span-4): `bg-primary-container text-on-primary-container rounded-3xl p-6` — label "Total Santri Aktif" uppercase 80%, angka "128" display, "+5 Santri bulan ini", ikon `group` 64px `bg-white/20 rounded-2xl`.
3. **DataTable Santri** — kolom:
   - **Nama Santri**: avatar inisial (bg bergantian: `secondary-container`/`primary-fixed-dim`/`secondary`/`primary-container`) + nama bold + "ID: 2024001" (12px outline).
   - **Kelas**: `ClassBadge` — "TKA - Alif", "TPA - Ba", "TQA - Ta" (`bg-tertiary-fixed`).
   - **Wali Santri**: nama + "0812-3456-xxxx" (12px outline).
   - **Status SPP**: `StatusBadge` dot — Lunas (green), Tunggakan (red).
   - **Aksi** (right, hover-only): Eye "Lihat Profil" + Pencil "Edit" (`opacity-0 group-hover:opacity-100`).
4. **PaginationBar** — "Menampilkan 1-10 dari 128 santri", halaman 1..3 … 13, aktif `bg-primary`.

### Fungsi
- Filter jenjang/kelas/status (client-side atau query param).
- Search navbar: "Cari santri, wali, atau ID...".
- "Tambah Santri" → modal form (nama, jenjang, kelas, wali, no HP, status — pola `ModalDialog`; form lengkap tidak ada di acuan, susun dari pola form pemasukan/pengeluaran).
- Row aksi: lihat profil (halaman/dialog detail), edit (modal praisi).
- Hapus santri → `ConfirmDialog` (tidak ada di acuan, wajib untuk integritas data).
- Pagination server-side.

---

## 3. Pembayaran SPP (Detail Santri)

**File acuan:** `pembayaran_spp_tpq_finance/code.html` — layout 2 kolom (4/8).

### Struktur
1. **PageHeader** — "Pembayaran SPP" + "Manajemen iuran bulanan santri TPQ Al-Ikhlas" + tombol **"Cetak PDF"** (`print`).
2. **Grid** `grid-cols-12 gap-gutter`:
   - **Kiri (col-span-4)**:
     - **GlassCard Profil Santri**: chip "Aktif" (`bg-primary/10 text-primary rounded-full`) absolute kanan atas; foto 128px `rounded-3xl border-4 border-white shadow-lg` + badge `verified_user` (`bg-white rounded-xl shadow-md`) pojok; nama "Zaki Ramadhan" (20px bold); "Kelas: Wustha (B-2)"; "ID: SANTRI-2024-089" (12px outline uppercase). Stat mini 2 kolom: **Total Lunas** "7 Bulan" (`bg-surface-container-low rounded-2xl p-4`, text primary) + **Tunggakan** "2 Bulan" (`bg-error-container/30`, text error).
     - **StatCardDark "Total Harus Dibayar"**: "Rp 150.000" (32px) + rincian "SPP Agustus 2024 Rp 75.000", "SPP September 2024 Rp 75.000" + divider `bg-white/10` + tombol **"Bayar Sekarang"** (`bg-primary-container rounded-2xl py-4 w-full`, ikon `payments`).
   - **Kanan (col-span-8)**:
     - **GlassCard Checklist Pembayaran 2024**: legenda dot (Lunas `bg-primary` / Belum `bg-surface-container-highest`); grid bulan `grid-cols-3 md:4 lg:6 gap-4` → `MonthlyChecklist`:
       - Lunas (JAN–JUL): `bg-primary text-white ring-4 ring-primary/5` + CheckCircle2.
       - Tunggakan (AGU): `bg-error-container text-error border-error/20 animate-pulse` + AlertCircle.
       - Belum (SEP–DES): `bg-surface-container-highest text-on-surface-variant/50` + Clock.
       - Hover: `scale-105` (non-primary), bulan belum → `bg-surface-container-high`.
     - **GlassCard Riwayat Pembayaran**: `DataTable` kolom No. Referensi (#TRX-88210) | Tanggal | Bulan SPP | Nominal | Status (Lunas `bg-primary/10 text-primary`) | Aksi (Download → unduh kwitansi).

### Fungsi
- Pilih santri (navigasi dari tabel santri / pencarian).
- Checklist: status per bulan, klik bulan → tandai bayar / buka modal pembayaran.
- "Bayar Sekarang" → modal konfirmasi pembayaran (nominal + bulan, `ModalDialog`).
- Riwayat: daftar pembayaran + unduh kwitansi.
- "Cetak PDF": ekspor laporan SPP santri.

---

## 4. Manajemen Pemasukan

**File acuan:** `manajemen_pemasukan_tpq_finance/code.html`

### Struktur
1. **Navbar khusus**: judul halaman "Pemasukan Kas" (primary bold) di kiri menggantikan search; search "Cari transaksi..." pill di kanan + notifikasi.
2. **Summary Bento** — `grid md:grid-cols-3 gap-6`:
   - **Total Pemasukan Bulan Ini** — ikon `account_balance_wallet` (`bg-primary/10 text-primary rounded-lg`), chip `+12%` (trending_up, `bg-primary/5`), nilai "Rp 12.450.000" (32px).
   - **Total Infaq & Sedekah** — ikon `payments` (`bg-secondary/10`), nilai "Rp 4.230.000", sub "Dari 84 donatur bulan ini".
   - **Pembayaran SPP Lunas** — ikon `event_available` (`bg-tertiary-container/20`), nilai "92%", `ProgressStat` bar 92%.
   - Hover: `-translate-y-1`.
3. **ActionBar** — kiri: Filter (outline, `filter_alt`), periode "Agustus 2024" (outline, `calendar_month`). Kanan: **Ekspor** (outline-primary, `file_download`), **"Tambah Pemasukan"** (primary, `add`).
4. **DataTable Riwayat Transaksi** — `DataCard` dengan header "Riwayat Transaksi" + "Menampilkan 48 transaksi terakhir"; kolom:
   - **Kategori**: `CategoryBadge` — SPP Santri (`bg-primary/10 text-primary`), Donasi (`bg-secondary-container`), Sewa Aset (`bg-tertiary-fixed`), Infaq Jumat (`bg-secondary-container`).
   - **Sumber**: nama (Zidan Al-Ghifari, Hamba Allah, Koperasi Masjid, Kotak Amal).
   - **Jumlah**: `font-bold text-primary`.
   - **Tanggal**: "14 Agt 2024" (variant).
   - **Catatan**: italic variant ("Pembayaran SPP Juli").
   - **Aksi**: `more_vert` (dropdown: lihat/edit/hapus).
   - Row hover `bg-primary/5`.
5. **PaginationBar** — footer `bg-surface-container-low`, "Menampilkan 1-5 dari 24 transaksi", tombol border `rounded-lg`.

### Fungsi
- **Modal "Tambah Pemasukan Baru"** (`ModalDialog`, `max-w-lg`, animasi scale): form — Kategori (select: SPP Santri, Donasi/Infaq, Sewa Aset, Lainnya), Sumber Dana (input text), grid 2-kolom Jumlah (Rp, number, `font-bold text-primary`) + Tanggal (date), Catatan (textarea), footer Batal + Simpan Data.
- Filter + search + ekspor (CSV/Excel/PDF — pilih CSV dulu).
- Dropdown per baris: edit, hapus (confirm), lihat detail.

---

## 5. Manajemen Pengeluaran

**File acuan:** `manajemen_pengeluaran_tpq_finance/code.html`

### Struktur
1. **PageHeader** — "Manajemen Pengeluaran" + "Pantau dan kelola semua biaya operasional TPQ secara transparan." + tombol **"Tambah Pengeluaran"** (primary, `add`, rounded-lg).
2. **Bento Stats** — `grid md:grid-cols-3 gap-gutter` (`BentoCard` + blob dekoratif):
   - **Total Bulan Ini** — "Rp 4.250.000", footer `trending_up` error "+12.5% vs bulan lalu" (blob `bg-primary/5`).
   - **Kategori Terbesar** — "Gaji Guru", footer `pie_chart` primary "65% dari total anggaran" (blob `bg-secondary/5`).
   - **Sisa Anggaran Ops** — "Rp 1.750.000", footer `schedule` variant "Berakhir dalam 12 hari" (blob `bg-error/5`).
3. **DataTable Riwayat Pengeluaran** — header card `bg-surface-bright` + judul "Riwayat Pengeluaran" + tombol Filter + Ekspor (outline pill `rounded-full`); kolom:
   - **Tanggal**: stack bold "24 Okt 2023" + "14:30 WIB" (12px).
   - **Kategori**: `CategoryBadge` — Operasional (`bg-secondary-container`), Gaji/Honor (`bg-tertiary-fixed`), Perawatan (`bg-surface-container`).
   - **Keterangan**: `truncate max-w-xs`.
   - **Bukti**: `ReceiptThumb` 48px, hover `ring-2 ring-primary` → preview modal.
   - **Jumlah** (right): bold, tanpa tanda minus (warna on-surface).
   - **Aksi**: `more_vert`.
4. **PaginationBar** — "Menampilkan 3 dari 42 transaksi", tombol `w-8 h-8 rounded border`, aktif primary.

### Fungsi
- **Modal "Catat Pengeluaran Baru"** (`ModalDialog` 500px, `rounded-[32px]`, header terpisah + deskripsi "Pastikan semua data sesuai dengan bukti fisik." + X lingkaran): form — Tanggal Transaksi (date + ikon `calendar_today` di dalam input), grid 2-kolom Kategori (Operasional/Gaji-Honor/Perawatan/Lain-lain) + Jumlah (Rp), Keterangan (textarea), **Unggah Bukti** (`FileUploadZone`: "PNG, JPG up to 10MB"), footer `bg-surface-container-low` Batal (flex-1) + **"Simpan Transaksi"** (flex-2).
- Filter, ekspor, preview bukti, dropdown edit/hapus.

---

## 6. Halaman pendukung (belum ada desain — pola mengikuti sistem)

| Halaman | Komponen | Fungsi inti |
|---|---|---|
| **Login** | `AppShell` tanpa sidebar; card center `GlassCard`; input + tombol primary; logo TPQ Finance | Autentikasi (email + password), role bendahara/admin |
| **Laporan** | `DataCard` + `FinanceBarChart` (bulanan/tahunan) + tabel ringkasan + `ActionBar` (Ekspor PDF) | Rekap pemasukan vs pengeluaran, laba/rugi, tunggakan per kelas, export |
| **Pengaturan** | `DataCard` + form (`FormInput`, `FormSelect`, `FormTextarea`) + `SaveButton` | Profil TPQ (nama, alamat), nominal SPP per jenjang, kategori, tahun ajaran, user |

Catatan: halaman ini baru ada sebagai item nav di acuan. Implementasi minimum: halaman placeholder dengan layout & komponen yang ada, isi fungsional fase akhir. Jangan buat lebih dulu (YAGNI) kecuali diminta.

---

## Responsive (semua halaman)

| Breakpoint | Perilaku |
|---|---|
| Desktop (≥1024px) | Layout acuan penuh: sidebar 256px + grid 12 kolom + `p-8` |
| Tablet (768-1023px) | Grid jadi 2 kolom (KPI), card filter full width (col-span-12), sidebar tetap visible (opsional: 64px ikon-only) |
| Mobile (<768px) | Sidebar → drawer + backdrop + hamburger; grid 1 kolom; `p-4-5`; search navbar disembunyikan/ikonsaja; FAB muncul di beranda; tabel tetap `overflow-x-auto` horizontal scroll; modal `max-w` → `w-full h-full` bottom-sheet atau `max-w-lg` dengan margin |
