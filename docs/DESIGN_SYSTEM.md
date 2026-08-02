# DESIGN_SYSTEM — TPQ Finance

Sumber acuan: `design/stitch/` (5 halaman + DESIGN.md).
Gaya: **High-End Minimalism + Glassmorphism** — "Trust (Amanah), Clarity, Modernity".
Seluruh teks UI dalam **Bahasa Indonesia** (EYD). Font angka pakai **tabular figures** agar kolom nominal sejajar.

---

## 1. Warna

Palet diambil langsung dari Material 3 token di kode HTML. Warna utama: **Emerald Green** (#006948) — simbol pertumbuhan & nilai Islami, dipadukan slate gelap untuk otoritas tipografi.

### Token inti (light mode — satu-satunya yang dipakai desain)

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#006948` | Tombol utama, teks aksen, ikon aktif, link |
| `on-primary` | `#ffffff` | Teks di atas primary |
| `primary-container` | `#00855d` | Logo sidebar, tombol "Bayar Sekarang" (versi gelap), avatar |
| `on-primary-container` | `#f5fff7` | Teks di atas primary-container |
| `primary-fixed` | `#85f8c4` | Container lunak hijau muda |
| `primary-fixed-dim` | `#68dba9` | Ikon KPI "Saldo Kas" (dengan bg 20%) |
| `secondary` | `#565e74` | Slate: bar pengeluaran chart, teks sekunder kuat |
| `secondary-container` | `#dae2fd` | **Nav aktif** di sidebar, tombol "Lihat Semua" |
| `on-secondary-container` | `#5c647a` | Teks nav aktif |
| `tertiary` | `#535f58` | Hijau abu: badge kelas santri, ikon KPI "Santri" |
| `tertiary-fixed` | `#d9e6dd` | Badge jenjang kelas (TKA/TPA/TQA) |
| `on-tertiary-fixed` | `#131e19` | Teks badge jenjang |
| `surface` | `#f8f9ff` | Latar sidebar |
| `background` | `#f8f9ff` | Latar halaman (body) |
| `on-surface` | `#121c2a` | Teks utama (judul, nominal) |
| `on-surface-variant` | `#3d4a42` | Teks sekunder (label, deskripsi, tanggal) |
| `surface-container-lowest` | `#ffffff` | **Kartu** (KPI, tabel, chart) |
| `surface-container-low` | `#eff4ff` | Header tabel, input, container user sidebar, search pill |
| `surface-container` | `#e6eeff` | Hover ringan, progress track |
| `surface-container-high` | `#dee9fc` | Hover nav/ikon, avatar inisial |
| `surface-container-highest` | `#d9e3f6` | Bulan SPP "Belum bayar" di checklist |
| `surface-bright` | `#f8f9ff` | Navbar glass, footer tabel |
| `outline` | `#6d7a72` | Border input, label filter, teks ID |
| `outline-variant` | `#bccac0` | Border kartu/divider (dipakai dengan opacity 30%) |
| `error` | `#ba1a1a` | Tunggakan, minus, dot notifikasi |
| `error-container` | `#ffdad6` | Bulan tunggakan (AGU) di checklist |
| `on-error` | `#ffffff` | — |
| `inverse-surface` | `#27313f` | **Kartu dark** "Total Harus Dibayar" (teks putih) |
| `inverse-on-surface` | `#eaf1ff` | Tooltip chart |
| `on-background` | `#121c2a` | Teks body default |

### Warna status (badge) — pakai kelas utility Tailwind (bukan token)

| Status | Kelas | Makna |
|---|---|---|
| Lunas | `bg-green-100 text-green-700` + dot `bg-green-500` | SPP lunas, transaksi sukses |
| Tunggakan | `bg-red-100 text-red-700` + dot `bg-red-500` | Santri menunggak |
| Proses | `bg-yellow-100 text-yellow-700` | Transaksi pending |
| Kategori hijau | `bg-primary/10 text-primary` | Badge kategori pemasukan |
| Kategori slate | `bg-secondary-container text-on-secondary-fixed-variant` | Badge kategori netral |
| Jenjang kelas | `bg-tertiary-fixed text-on-tertiary-fixed` | Badge kelas santri |
| Delta positif | `bg-primary/10 text-primary` | Chip +2.4% di KPI |
| Delta negatif | `bg-error/10 text-error` | Chip -12% di KPI |

### Aturan
- Shadow **tidak boleh hitam pekat** — campur warna primary/slate opacity 2-3% (soft bloom).
- Glassmorphism: putih 60-80% opacity + `backdrop-blur(12px)` untuk navbar, modal overlay.
- Dark mode: desain acuan menyediakan token dark (`dark:bg-inverse-surface` dll.) — implementasi wajib menyertakan variabel dark di CSS, mode aktif opsional tahap akhir.

---

## 2. Tipografi

Font: **Geist** (via Google Fonts, `wght 100..900`). Fallback: `sans-serif`.
Angka keuangan: `font-variant-numeric: tabular-nums`.

| Style | Ukuran | Berat | Line-height | Letter-spacing | Pemakaian |
|---|---|---|---|---|---|
| `display-lg` | 48px (mobile 32px) | 700 | 56px (mobile 40px) | -0.02em | Salam "Assalamu'alaikum, Aisyah!" |
| `headline-md` | 24px | 600 | 32px | -0.01em | Judul section, nama kartu KPI, judul modal |
| `body-lg` | 18px | 400 | 28px | — | Deskripsi welcome |
| `body-md` | 16px | 400 | 24px | — | Body default, teks tabel |
| `label-sm` | 14px | 500 | 20px | 0.05em | Label form, judul KPI (dengan uppercase tambahan), nav |
| Micro | 10-12px | 400-700 | — | uppercase + tracking-wider | ID santri, tanggal, sublabel, chip |

### Skala heading alternatif yang muncul di kode
- KPI angka besar: `text-[32px] font-bold` (pemasukan/pengeluaran) atau `text-headline-md` (beranda).
- Judul halaman: `text-headline-md` (24px) — "Data Master Santri", "Pembayaran SPP".
- Sub-judul kartu: `text-[18px] font-bold` (headline-md turunan).

---

## 3. Spacing

- **Vertical rhythm**: kelipatan 8px. Stack antar-section: `space-y-8` (32px), `gap-6` (24px), `gap-4` (16px).
- **Container**: `max-w-[1400px] mx-auto` (beranda, pembayaran SPP) atau `max-w-container-max` (1280px) — implementasi seragamkan ke 1280px.
- **Gutter halaman**: `p-8` (32px) pada main content; turun ke `p-4`/`p-5` di mobile.
- **Padding kartu**: minimum 24px, standar **32px** (`p-8`) — nuansa premium "gallery".
- **Grid**:
  - Desktop: 12 kolom, gutter 24px, margin 32px.
  - Tablet: 8 kolom, gutter 16px, margin 24px.
  - Mobile: 4 kolom, gutter 16px, margin 16px.
- Tombol aksi utama: tinggi **48px** (`py-3`).
- Sidebar: `w-64` (256px), padding `p-4`, item nav `px-4 py-3`, gap antar item `space-y-1` / `gap-2`.
- Navbar: `h-16` (64px), `px-gutter` (24px).
- Sel tabel: `px-6`–`px-8` horizontal, `py-4` header, `py-5` isi.

---

## 4. Border Radius

| Skala | Nilai | Pemakaian |
|---|---|---|
| `rounded-lg` | 8px | Tombol, input, nav item, ikon container |
| `rounded-xl` | 12px | Kartu KPI pemasukan/pengeluaran, avatar logo, tooltip |
| `rounded-2xl` | 16px | Modal, kartu stat mini, checklist bulan, upload zone |
| `rounded-3xl` | 24px | **Kartu utama** santri/pembayaran, kartu dark summary, kartu filter |
| `rounded-[24px]` | 24px | Kartu bento pengeluaran |
| `rounded-full` | 9999px | Badge/pill, avatar, search bar, tombol ikon, bulan checklist di beranda (chart bar `rounded-t-full`) |

Aturan desain: elemen standar 8px; container/kartu dashboard wajib 24px.

---

## 5. Shadow

| Level | Nilai | Pemakaian |
|---|---|---|
| Level 0 | tanpa shadow | Background `#F9FAFB` |
| Level 1 (Soft Bloom) | `0px 4px 20px rgba(0,0,0,0.03)` | Semua kartu putih (`soft-bloom`) |
| Level 2 (Modal/Overlay) | `0px 12px 40px rgba(0,0,0,0.08)` + `backdrop-blur(12px)` putih 70% | Modal |
| Hover tombol primary | `shadow-lg shadow-primary/20` | Tombol "Tambah Transaksi" |
| Kartu dark | `shadow-xl` | Kartu "Total Harus Dibayar" |

Implementasi: buat utility `soft-bloom` (atau token `shadow-soft`) di Tailwind.

---

## 6. Button

| Varian | Kelas | Pemakaian |
|---|---|---|
| **Primary** | `bg-primary text-on-primary rounded-xl font-bold px-6 py-3` + hover `opacity-90` / `shadow-primary/20`, `active:scale-95` | Tambah Santri, Tambah Pemasukan, Tambah Pengeluaran, Tambah Transaksi, Cetak PDF, Simpan Data |
| **Secondary/Container** | `bg-secondary-container text-on-secondary-container rounded-xl font-bold` | "Lihat Semua" (beranda), nav aktif |
| **Outline** | `border border-outline-variant bg-white rounded-lg font-label-sm hover:bg-surface-container` | Filter, Ekspor, tombol pagination |
| **Outline-primary** | `border border-outline text-primary font-bold hover:bg-primary/5` | Ekspor (pemasukan) |
| **Ghost ikon** | `p-2 rounded-lg hover:bg-surface-container-high` | Aksi baris tabel (lihat, edit), tombol ikon navbar |
| **Link** | `text-primary font-bold hover:underline` | "Lihat Semua Transaksi" |
| **Dark** | `bg-primary-container text-white` di atas `bg-inverse-surface` | "Bayar Sekarang" |
| **FAB mobile** | `fixed bottom-8 right-8 w-14 h-14 bg-primary rounded-2xl shadow-2xl md:hidden` | Tombol tambah cepat (hanya beranda) |

Sifat: tinggi 48px untuk aksi utama; ikon kiri 18-20px + label; `active:scale-95` micro-interaction semua tombol.

---

## 7. Form & 8. Input

**Pola form (modal):**
- Label di atas input: `font-label-sm text-on-surface-variant mb-1` (atau `space-y-2`).
- Grid 2 kolom untuk pasangan field (Jumlah+Tanggal, Kategori+Jumlah) → 1 kolom di mobile.
- Footer aksi: tombol Batal (outline, `flex-1`) + Simpan (primary, `flex-[2]`) di area `bg-surface-container-low`.
- Modal form pemasukan: bg input `bg-surface-bright`.
- Modal form pengeluaran: input putih `bg-white` + border.

**Input:**
- Default: `border border-outline-variant rounded-lg px-4 py-3` (tinggi ~48px), white/surface-bright.
- Focus: `ring-2 ring-primary` (emerald) + `border-primary` + outline none.
- Search di navbar: **pill** `rounded-full bg-surface-container-low border-none pl-10 pr-4 py-2` + ikon search absolute kiri, focus `ring-2 ring-primary/20`.
- Select: `appearance-none` + chevron; select periode chart tanpa border (`bg-surface-container-low rounded-lg`).
- Textarea: `rounded-lg rows=3 resize-none`.
- Date: `<input type="date">` native.
- **Upload bukti** (pengeluaran): `border-2 border-dashed border-outline-variant rounded-2xl p-8 text-center`, hover `border-primary bg-primary/5`, ikon `cloud_upload` 36px primary, teks "Klik untuk unggah atau seret file ke sini", hint "PNG, JPG up to 10MB".

---

## 9. Card

| Tipe | Kelas | Pemakaian |
|---|---|---|
| Kartu KPI | `bg-surface-container-lowest p-8 rounded-xl/large soft-bloom border border-outline-variant/30 hover:border-primary/30` + lift `hover:-translate-y-1` / `translateY(-4px)` | Saldo, pemasukan, pengeluaran, santri |
| Kartu bento (pengeluaran) | `bg-white rounded-[24px] soft-bloom border relative overflow-hidden` + **dekorasi blob** `absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110` | Statistik pengeluaran |
| Kartu dark | `bg-inverse-surface text-white rounded-3xl shadow-xl relative overflow-hidden` + watermark ikon `text-[160px] opacity-10` | Total Harus Dibayar |
| Glass card | `bg-white/80 backdrop-blur-xl border border-white/30 rounded-3xl` | Kartu profil santri, checklist, riwayat |
| Kartu filter | `bg-white p-6 rounded-3xl soft-bloom flex flex-wrap gap-4` | Filter jenjang/kelas/status |

Struktur KPI standar: ikon container kiri atas (`p-3 rounded-xl` + bg warna/20) → chip/badge kanan atas → label uppercase 11px → nilai 24-32px bold. Hover: kartu terangkat 4px.

---

## 10. Table

- Container: kartu putih `rounded-2xl/3xl soft-bloom overflow-hidden` + `overflow-x-auto` (responsive).
- **Tanpa border vertikal.** Divider horizontal `divide-y divide-outline-variant/20-30`.
- Header: `bg-surface-container-low` (atau `bg-surface-bright`), `font-label-sm text-on-surface-variant uppercase tracking-wider`, `px-6-8 py-4`, rata kiri (kecuali kolom nominal/aksi rata kanan).
- Baris: `px-6-8 py-5`, hover `bg-surface-container-lowest` / `bg-primary/5` / `group`.
- Kolom nominal: `font-bold` + warna (hijau untuk masuk, `text-error` untuk keluar dengan tanda `-`).
- Aksi baris: ikon `visibility`/`edit` (santri) atau `more_vert` (pemasukan/pengeluaran) — di santri muncul **hover-only** (`opacity-0 group-hover:opacity-100`).
- Kolom deskripsi panjang: `truncate max-w-xs`.
- Sel tanggal (pengeluaran): stack `font-bold` (tgl) + `text-xs` (jam).
- **Pagination**: footer `border-t`, kiri "Menampilkan X-Y dari Z transaksi", kanan tombol `w-8 h-8 rounded border` — aktif `bg-primary text-white`, prev/next ikon chevron, `disabled:opacity-30`.

---

## 11. Badge / Chip

- Bentuk **pill** (`rounded-full`), `px-3 py-1`, `text-[11-12px] font-bold`, sering `uppercase tracking-wide`.
- Variasi warna: lihat tabel status di bagian Warna.
- Badge status dengan dot: `flex items-center gap-1 w-fit` + `w-1.5 h-1.5 rounded-full` berwarna.
- Chip delta KPI: `px-2 py-1 rounded-full bg-<warna>/10 text-<warna> text-[12px] font-bold`.
- Chip periode: `px-2 py-1 rounded-full bg-secondary/10 text-secondary` (chip "Agustus" di KPI pemasukan).

---

## 12. Modal

- Overlay: `fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm`.
- Panel: `bg-surface-container-lowest (atau white) rounded-2xl/3xl shadow-2xl max-w-lg` + transisi `scale-95 → scale-100` (pemasukan) atau `top-1/2 left-1/2 -translate-x/y` (pengeluaran).
- Header: judul `headline-md` + tombol close (ikon `close`, lingkaran, hover bg).
- Pengeluaran: header terpisah dengan border-b + deskripsi kecil; body scroll `max-h-[90vh] overflow-y-auto`; footer `bg-surface-container-low flex gap-4` (Batal `flex-1` outline, Simpan `flex-[2]` primary).
- Pemasukan: satu panel `p-8` + form `space-y-4`.
- **Aksesibilitas (wajib)**: fokus trap, `role="dialog"`, `aria-modal`, Escape menutup, klik backdrop menutup, focus ke elemen pertama saat buka. (Desain statis tidak punya ini — ini penambahan teknis wajib, bukan perubahan desain.)

---

## 13. Sidebar

- `fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant flex flex-col p-4 z-50`.
- **Brand**: ikon logo 40px (`bg-primary-container rounded-lg`, ikon `account_balance` filled) + "TPQ Finance" (primary, bold) + sublabel ("Bendahara TPQ" / "Sistem Bendahara" / "Sistem Akuntansi Amanah" — bervariasi antar halaman; seragamkan "Bendahara TPQ").
- **Nav** (7 item, urut tetap): Beranda (`dashboard`), Santri (`group`), Pembayaran SPP (`payments`), Pemasukan (`account_balance_wallet`), Pengeluaran (`receipt_long`), Laporan (`assessment`), Pengaturan (`settings`).
- Item: `flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high`; ikon Material → **Lucide**.
- **Aktif**: `bg-secondary-container text-on-secondary-container rounded-lg font-bold scale-[0.98]` + ikon **filled**.
- **User footer**: `mt-auto pt-4/6 border-t border-outline-variant`, avatar 40px (foto/inisial) + nama bold + role uppercase 10px; di pembayaran SPP versi card `bg-surface-container-low rounded-xl p-4`.
- **Mobile (wajib)**: sidebar jadi drawer overlay (`translate-x` off-canvas) + hamburger di navbar + backdrop. Ini penyesuaian teknis responsive — desain acuan hanya desktop.

---

## 14. Navbar (Top App Bar)

- `sticky top-0 h-16 bg-surface-bright/70 backdrop-blur-xl border-b border-outline-variant z-40 flex justify-between items-center px-gutter` (di beberapa halaman `fixed` + `left-64` — implementasi pakai sticky + `ml-64`).
- Kiri: **search pill** `rounded-full bg-surface-container-low border-none pl-10 pr-4 py-2` (placeholder bervariasi per halaman: "Cari santri, transaksi, atau laporan...", "Cari santri, wali, atau ID..."). Di pemasukan: judul halaman "Pemasukan Kas" sebagai pengganti search.
- Kanan: tombol notifikasi (badge dot merah `w-2 h-2 bg-error rounded-full`), divider `h-8 w-px bg-outline-variant`, lalu info konteks: tanggal hari ini + ikon `calendar_today` (santri), atau label judul + tanggal (beranda), atau nama user + avatar (pembayaran SPP).
- Mobile: search mengecil/sembunyi (`hidden sm:flex`), hamburger muncul di kiri.

---

## 15. Chart

**Bar chart "Tren Keuangan" (beranda)** — implementasi dengan Recharts (sudah umum di ekosistem shadcn; alternatif: bar div murni seperti mockup):
- Card: `lg:col-span-2`, header judul + subjudul + select periode (`bg-surface-container-low rounded-lg`).
- Data: 6 bulan (Mar–Agu), 2 seri per bulan: **Pemasukan** `bg-primary` (emerald) vs **Pengeluaran** `bg-secondary` (slate). Bulan berjalan (Agu): bar aktif `bg-primary-container` + `scale-x-110` + label bulan bold.
- Bar: `w-4 rounded-t-full`, tinggi proporsional (40-95%).
- Grid line horizontal: `border-b border-outline-variant/30` (4 garis).
- **Tooltip hover**: `bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-3 rounded-lg` ("Rp 8.200.000 (In)").
- Label bulan: `text-label-sm text-on-surface-variant`.
- Recharts mapping: `Bar dataKey="pemasukan" fill="#006948"`, `dataKey="pengeluaran" fill="#565e74"`, `radius={[8,8,0,0]}` (ponytail: mockup pakai rounded-t-full), tooltip custom mengikuti gaya dark pill, CartesianGrid stroke `#bccac0` opacity 0.3.

**Progress bar** (pemasukan): `w-full bg-surface-container h-2 rounded-full` + fill `bg-primary` (92%) — indikator "Pembayaran SPP Lunas".

**Legenda checklist** (pembayaran SPP): dot `w-3 h-3 rounded-full bg-primary` (Lunas) / `bg-surface-container-highest` (Belum).

---

## Ikon

- Desain acuan: **Material Symbols** → implementasi wajib **Lucide Icons** (sudah disyaratkan).
- Mapping: `dashboard`→LayoutDashboard, `group`→Users, `payments`→Wallet/CreditCard, `account_balance_wallet`→Wallet, `receipt_long`→ReceiptText, `assessment`→BarChart3, `settings`→Settings, `search`→Search, `notifications`→Bell, `add`→Plus, `close`→X, `more_vert`→MoreVertical, `edit`→Pencil, `visibility`→Eye, `chevron_left/right`→ChevronLeft/Right, `trending_up/down`→TrendingUp/Down, `check_circle`→CheckCircle2, `error`→AlertCircle, `pending`→Clock, `download`→Download, `print`→Printer, `filter_list`→Filter, `calendar_today`→Calendar, `cloud_upload`→UploadCloud, `account_balance`→Landmark, `verified_user`→ShieldCheck, `event_available`→CalendarCheck, `schedule`→Clock, `pie_chart`→PieChart, `volunteer_activism`→HeartHandshake, `school`→GraduationCap, `menu_book`→BookOpen, `electric_bolt`→Zap.
- Ikon "filled" pada item aktif → Lucide `fill="currentColor"` atau varian solid bila ada.

## Implementasi teknis (ringkas)

- **Tailwind config**: extend `colors` dengan token M3 di atas (light) + token dark; `fontFamily.display/body = Geist`; `boxShadow.soft = 0 4px 20px rgba(0,0,0,0.03)`; `maxWidth.container-max = 1280px`.
- **shadcn/ui**: gunakan `Card`, `Button`, `Input`, `Select`, `Table`, `Badge`, `Dialog` (modal), `Avatar`, `DropdownMenu` (menu more_vert), `Tabs`, `Tooltip`, `Skeleton`, `Pagination` — semua di-token-kan ke desain di atas via `tailwind.config` + `components.json` alias.
- Font Geist via `next/font/google` (`Geist` tersedia di Google Fonts). `tabular-nums` untuk nominal.
- Dark mode: class strategy, default light (desain acuan `html class="light"`).
