# PRD — TPQ Finance
**Product Requirements Document**

| | |
|---|---|
| Nama Produk | TPQ Finance |
| Versi Dokumen | 1.0 |
| Status | Draft — siap review |
| Tanggal | 2026-08-02 |
| Basis Desain | `design/stitch/` (5 halaman + DESIGN.md) |
| Dokumen Terkait | `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_INVENTORY.md`, `docs/PAGE_SPECIFICATIONS.md`, `docs/IMPLEMENTATION_PLAN.md` |
| Referensi Desain Visual | `docs/` + screenshot `*/screen.png` per halaman |

---

## 1. Latar Belakang

TPQ (Taman Pendidikan Al-Qur'an) adalah lembaga pendidikan Islam non-formal yang mengajarkan baca tulis Al-Qur'an dan dasar-dasar agama kepada anak-anak. Pengelolaan keuangan TPQ umumnya masih dilakukan secara manual — catat di buku kas, kuitansi kertas, atau spreadsheet sederhana. Praktek ini menimbulkan masalah:

- **Pencatatan tidak terpusat**: data pemasukan (SPP, infaq, donasi) dan pengeluaran (gaji ustadz, operasional, perawatan) tersebar di buku, catatan pribadi, dan kuitansi.
- **Tunggakan SPP tidak terpantau**: bendahara kesulitan mengetahui santri mana yang belum membayar, berapa bulan, dan berapa totalnya.
- **Rekap bulanan/tahunan lambat dan rawan salah hitung**: laporan keuangan disusun manual menjelang rapat pengurus.
- **Transparansi rendah**: pengurus yayasan/pengasuh kesulitan memverifikasi arus kas TPQ secara cepat.

TPQ Finance hadir sebagai **sistem manajemen keuangan khusus lembaga pendidikan Al-Qur'an** — mencatat, memantau, dan melaporkan seluruh arus kas TPQ dalam satu aplikasi web modern. Desain antarmuka mengikuti standar **TPQ Finance Design System** (emerald green sebagai warna identitas — simbol pertumbuhan dan nilai Islami, dikombinasikan dengan slate gelap untuk kesan amanah dan profesional), dengan prinsip *High-End Minimalism + Glassmorphism*.

## 2. Tujuan Produk

### 2.1 Tujuan Utama
Menyediakan aplikasi web yang **amanah, jelas, dan modern** bagi bendahara TPQ untuk mengelola seluruh keuangan lembaga secara terpusat, akurat, dan transparan.

### 2.2 Tujuan Spesifik
1. Memusatkan pencatatan pemasukan (SPP santri, infaq, donasi, sewa aset) dan pengeluaran (gaji, operasional, perawatan, pengadaan) dalam satu sistem.
2. Memantau status pembayaran SPP per santri dan per bulan secara real-time, termasuk tunggakan.
3. Menyajikan ringkasan keuangan (saldo, pemasukan, pengeluaran, jumlah santri) di dashboard.
4. Menyediakan laporan keuangan yang dapat diekspor (CSV) dan dicetak (kwitansi, laporan PDF).
5. Memberikan pengalaman penggunaan yang konsisten di desktop, tablet, dan smartphone.

### 2.3 Non-Tujuan (V1)
- Bukan aplikasi pembayaran/payment gateway (tanpa transaksi uang elektronik).
- Bukan sistem akademik santri (nilai, absensi, hafalan) — hanya data pokok santri yang relevan untuk keuangan.
- Bukan aplikasi mobile native — web responsif.

## 3. Permasalahan yang Diselesaikan

| # | Masalah | Solusi TPQ Finance |
|---|---|---|
| P1 | Pencatatan manual tersebar (buku, kuitansi, spreadsheet) | Satu database terpusat: santri, transaksi pemasukan/pengeluaran, pembayaran SPP |
| P2 | Tunggakan SPP tidak terpantau | Dashboard "Tunggakan SPP", badge status per santri, checklist pembayaran 12 bulan |
| P3 | Rekap manual lambat & salah hitung | Perhitungan otomatis: saldo, total bulan ini, persentase lunas, delta vs bulan lalu |
| P4 | Laporan tidak transparan | Halaman Laporan + ekspor CSV + kwitansi cetak |
| P5 | Data santri & wali tidak terpusat | Manajemen santri dengan data wali, kelas, jenjang, ID |
| P6 | Bukti pengeluaran hilang | Unggah foto bukti (nota/struk) per transaksi pengeluaran |
| P7 | Kesulitan mencari data | Pencarian global di navbar (santri, transaksi, laporan) + filter tabel |
| P8 | Akses dari luar kantor terbatas | Aplikasi web responsif — akses dari HP/tablet |

## 4. Target Pengguna

| Segmen | Deskripsi | Contoh |
|---|---|---|
| **Bendahara TPQ** (pengguna utama) | Mengelola seluruh pencatatan keuangan harian: input transaksi, tagih SPP, rekap, ekspor laporan | Ibu Aisyah, bendahara TPQ Al-Hidayah |
| **Pengasuh / Ketua TPQ** | Memantau kesehatan keuangan, melihat laporan, memverifikasi arus kas | Ustadz Ahmad, pengasuh TPQ |
| **Pengurus Yayasan** | Meninjau laporan berkala (bulanan/tahunan) | Pengurus yayasan |
| **Wali Santri** (V2) | Melihat tagihan dan status pembayaran anak, mendapat notifikasi tunggakan | Bp. Sulaiman, wali santri |

Catatan: V1 berfokus pada bendahara + pengasuh/ketua (peran admin & viewer). Wali santri masuk V2 (lihat Roadmap).

## 5. Hak Akses Pengguna

V1 mendukung 3 peran dengan prinsip *least privilege*:

| Peran | Deskripsi | Hak Akses |
|---|---|---|
| **Super Admin** | Pemilik sistem, biasanya pengasuh/pengurus | Semua akses + kelola pengguna & pengaturan TPQ |
| **Bendahara** | Pengguna harian utama | CRUD santri, transaksi pemasukan/pengeluaran, pembayaran SPP; lihat laporan; ekspor; cetak kwitansi |
| **Viewer** (Pengasuh/Reviewer) | Hanya memantau | Lihat dashboard, semua tabel, laporan, detail santri. **Tanpa** tambah/edit/hapus dan tanpa ekspor? (lihat FR-AUTH-04) |

| Kemampuan | Super Admin | Bendahara | Viewer |
|---|---|---|---|
| Lihat dashboard & semua data | ✅ | ✅ | ✅ |
| Kelola santri (tambah/edit/hapus) | ✅ | ✅ | ❌ |
| Catat pemasukan/pengeluaran | ✅ | ✅ | ❌ |
| Catat pembayaran SPP | ✅ | ✅ | ❌ |
| Hapus transaksi | ✅ | ✅ (hanya punya sendiri) | ❌ |
| Ekspor CSV / cetak laporan | ✅ | ✅ | ❌ |
| Kelola pengguna & peran | ✅ | ❌ | ❌ |
| Ubah pengaturan TPQ (nominal SPP, kategori) | ✅ | ✅ | ❌ |

FR-AUTH-04: ekspor & cetak dibatasi bendahara/super admin untuk menjaga integritas data; viewer hanya melihat. *(Keputusan produk — bisa direvisi jika pengurus ingin viewer ikut ekspor.)*

## 6. Ruang Lingkup

### 6.1 Dalam Lingkup (V1)
- Autentikasi & manajemen sesi (login/logout).
- Dashboard beranda: KPI, grafik tren 6 bulan, tunggakan, transaksi terbaru.
- Manajemen santri: CRUD, filter, pencarian, pagination.
- Manajemen pembayaran SPP: checklist bulanan per santri, riwayat pembayaran, kwitansi.
- Manajemen pemasukan: catat/lihat/filter/ekspor transaksi pemasukan (SPP, infaq, donasi, sewa aset, lainnya).
- Manajemen pengeluaran: catat/lihat/filter/ekspor, unggah bukti.
- Laporan keuangan: rekap bulanan/tahunan, ekspor CSV, cetak PDF.
- Pengaturan: profil TPQ, nominal SPP per jenjang, kategori transaksi, tahun ajaran.

### 6.2 Di Luar Lingkup (V1, ditunda)
- Portal wali santri & notifikasi WhatsApp/email (V2).
- Payment gateway / pembayaran online (V2).
- Multi-cabang / multi-TPQ (V3).
- Backup otomatis cloud, audit log lanjutan (V2/V3).

## 7. Daftar Fitur

### F1 — Autentikasi
F1.1 Login email + password. F1.2 Logout. F1.3 Proteksi route per peran. F1.4 Sesi kedaluwarsa.

### F2 — Dashboard (Beranda)
F2.1 Salam personalisasi + ringkasan harian. F2.2 4 kartu KPI: Total Saldo Kas, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Total Santri Aktif (dengan chip delta/period). F2.3 Grafik tren pemasukan vs pengeluaran 6 bulan + filter periode. F2.4 Daftar tunggakan SPP (nama, kelas, nominal, durasi) + "Lihat Semua". F2.5 Tabel transaksi terbaru (5 terakhir) + "Tambah Transaksi" (FAB di mobile). F2.6 Link "Lihat Semua Transaksi".

### F3 — Manajemen Santri
F3.1 Daftar santri: nama, avatar inisial, ID, kelas, wali, status SPP, aksi. F3.2 Tambah santri (modal). F3.3 Edit santri. F3.4 Hapus santri (konfirmasi). F3.5 Filter jenjang/kelas/status pembayaran. F3.6 Pencarian (navbar). F3.7 Pagination. F3.8 Lihat profil santri (detail + statistik pembayaran).

### F4 — Pembayaran SPP
F4.1 Halaman SPP per santri: kartu profil + total harus dibayar. F4.2 Checklist pembayaran 12 bulan (Lunas/Tunggakan/Belum). F4.3 Catat pembayaran ("Bayar Sekarang" / klik bulan). F4.4 Riwayat pembayaran (no referensi, tanggal, bulan, nominal, status). F4.5 Unduh kwitansi. F4.6 Cetak PDF laporan SPP santri.

### F5 — Manajemen Pemasukan
F5.1 3 kartu ringkasan: total bulan ini (+delta), total infaq & sedekah, % SPP lunas (progress bar). F5.2 Tabel riwayat: kategori, sumber, jumlah, tanggal, catatan, aksi. F5.3 Tambah pemasukan (modal: kategori, sumber, jumlah, tanggal, catatan). F5.4 Edit & hapus pemasukan. F5.5 Filter kategori + pilih periode. F5.6 Pencarian. F5.7 Ekspor CSV.

### F6 — Manajemen Pengeluaran
F6.1 3 kartu ringkasan: total bulan ini (+delta), kategori terbesar, sisa anggaran ops. F6.2 Tabel riwayat: tanggal+jam, kategori, keterangan, bukti, jumlah, aksi. F6.3 Tambah pengeluaran (modal: tanggal, kategori, jumlah, keterangan, unggah bukti). F6.4 Edit & hapus pengeluaran. F6.5 Preview bukti (modal gambar). F6.6 Filter + ekspor CSV.

### F7 — Laporan
F7.1 Rekap pemasukan vs pengeluaran per bulan (grafik + tabel). F7.2 Ringkasan per kategori. F7.3 Rekap tunggakan per kelas/jenjang. F7.4 Ekspor CSV. F7.5 Cetak PDF laporan.

### F8 — Pengaturan
F8.1 Profil TPQ (nama, alamat, identitas). F8.2 Nominal SPP per jenjang (TKA/TPA/TQA). F8.3 Kategori pemasukan & pengeluaran (tambah/ubah). F8.4 Tahun ajaran aktif.

### F9 — Sistem
F9.1 Responsif penuh (desktop/tablet/mobile). F9.2 Dark mode (token siap; toggle opsional). F9.3 Pencarian global. F9.4 Notifikasi in-app (belum bayar, transaksi baru). F9.5 Bahasa Indonesia (EYD) di seluruh antarmuka.

## 8. User Journey

### Journey 1 — Bendahara mencatat SPP harian (alur inti)
1. **Masuk**: Bendahara membuka aplikasi, login (email+password). Diarahkan ke Beranda.
2. **Sapaan**: Melihat salam "Assalamu'alaikum, [Nama]" + ringkasan hari ini (saldo, pemasukan/pengeluaran bulan ini, santri aktif).
3. **Cek tagihan**: Dari Beranda membuka menu **Santri** → cari nama santri (atau langsung buka **Pembayaran SPP** dari nav).
4. **Lihat status**: Membuka halaman SPP santri → melihat checklist 12 bulan: bulan-bulan yang sudah Lunas (hijau), bulan berjalan ditandai Tunggakan (merah), bulan depan Belum.
5. **Terima bayaran**: Wali santri membayar. Bendahara klik **"Bayar Sekarang"** → modal: pilih bulan & nominal → **Simpan**.
6. **Verifikasi**: Checklist bulan berubah hijau + muncul di Riwayat Pembayaran + saldo kas di Beranda bertambah.
7. **Beri bukti**: Klik ikon unduh di riwayat → kwitansi tercetak untuk wali.
8. **Selesai**: Notifikasi toast "Pembayaran berhasil disimpan". Bendahara lanjut ke santri berikutnya.

### Journey 2 — Bendahara mencatat pemasukan donasi
1. Buka menu **Pemasukan** → kartu ringkasan menampilkan total bulan ini, infaq, % lunas SPP.
2. Klik **"Tambah Pemasukan"** → modal: pilih Kategori (Donasi/Infaq), isi Sumber Dana ("Hamba Allah"), Jumlah, Tanggal, Catatan.
3. **Simpan Data** → baris baru muncul di tabel + total kartu bertambah + toast sukses.
4. Di akhir bulan: klik **Ekspor** → file CSV riwayat pemasukan untuk arsip/laporan pengurus.

### Journey 3 — Bendahara mencatat pengeluaran dengan bukti
1. Buka menu **Pengeluaran** → lihat kartu: total bulan ini, kategori terbesar (Gaji Guru), sisa anggaran.
2. Klik **"Tambah Pengeluaran"** → modal: tanggal, kategori (Operasional), jumlah (Rp 450.000), keterangan, **unggah foto nota** (drag-drop/klik).
3. **Simpan Transaksi** → baris baru di tabel dengan thumbnail bukti; total bulan ini bertambah; delta vs bulan lalu ter-update.
4. Klik thumbnail bukti kapan saja → preview foto nota.

### Journey 4 — Pengasuh memantau keuangan
1. Login sebagai Viewer → langsung ke Beranda.
2. Lihat 4 KPI + grafik tren 6 bulan + daftar tunggakan.
3. Buka **Laporan** → rekap bulanan, filter periode, lihat per kategori.
4. Tidak bisa menambah/mengubah data (tombol aksi disembunyikan/tidak aktif). Menutup aplikasi.

### Journey 5 — Santri baru masuk TPQ
1. Bendahara buka **Santri** → **"Tambah Santri"** → modal: nama, jenjang (TPA), kelas (Ba), wali, nomor HP, status.
2. **Simpan** → santri muncul di tabel dengan ID otomatis; status SPP "Tunggakan" bila ada bulan berjalan belum dibayar.
3. Halaman SPP santri siap dipakai mulai bulan berikutnya.

## 9. User Flow

### 9.1 Alur Login
```
Mulai → Buka aplikasi → Sudah login?
  ├─ Ya → Beranda
  └─ Tidak → Halaman Login
       → Isi email & password
       → Valid? 
          ├─ Ya → Set sesi → Arahkan ke Beranda (sesuai peran)
          └─ Tidak → Tampilkan error "Email atau password salah"
                    → Coba lagi (3x gagal → pesan tunggu/kunci sementara)
```

### 9.2 Alur Catat Pembayaran SPP
```
Santri (tabel) → [Eye] Profil / [nav] Pembayaran SPP → Halaman SPP santri
  → Checklist: klik bulan belum lunas / tombol "Bayar Sekarang"
  → Modal Pembayaran: pilih bulan (multi?) + nominal terisi otomatis
  → [Simpan]
     ├─ Sukses → Toast ✓ → checklist hijau → riwayat +1 → saldo +nominal
     └─ Gagal (validasi) → Error inline di form
```

### 9.3 Alur Tambah Transaksi (Pemasukan/Pengeluaran)
```
Halaman Pemasukan/Pengeluaran → [Tambah Pemasukan/Pengeluaran]
  → Modal form (kategori, sumber/keterangan, jumlah, tanggal, catatan[, bukti])
  → [Simpan]
     ├─ Valid → Toast ✓ → tabel refresh → kartu ringkasan update
     └─ Invalid → pesan error per field (jumlah ≤ 0, kategori kosong, bukti >10MB)
```

### 9.4 Alur Hapus Data (santri/transaksi)
```
Baris → [MoreVertical]/[Edit] → pilih Hapus
  → ConfirmDialog "Hapus data ini? Tindakan tidak dapat dibatalkan."
  → [Ya, Hapus] → Toast "Data dihapus" → tabel refresh
  → [Batal] → kembali tanpa perubahan
```

### 9.5 Alur Ekspor & Cetak
```
Laporan/Pemasukan/Pengeluaran → [Ekspor]
  → Buat CSV (sesuai filter aktif) → unduh file
Cetak PDF (SPP/Laporan) → Halaman cetak (template) → browser print → PDF
```

## 10. Functional Requirements

### FR-AUTH — Autentikasi & Sesi
| ID | Requirement | Prioritas |
|---|---|---|
| FR-AUTH-01 | Sistem menyediakan halaman login (email + password) | P0 |
| FR-AUTH-02 | Sistem memvalidasi kredensial; error "Email atau password salah" pada kegagalan | P0 |
| FR-AUTH-03 | Sistem melindungi semua halaman aplikasi; user belum login diarahkan ke login | P0 |
| FR-AUTH-04 | Sistem membatasi aksi sesuai peran (Super Admin / Bendahara / Viewer) — lihat §5 | P0 |
| FR-AUTH-05 | Sistem menyediakan logout; sesi berakhir | P0 |
| FR-AUTH-06 | Sesi kedaluwarsa otomatis (idle timeout, mis. 30 menit) → kembali ke login | P1 |
| FR-AUTH-07 | (V2) Reset password via email | P2 |

### FR-DASH — Dashboard
| ID | Requirement | Prioritas |
|---|---|---|
| FR-DASH-01 | Menampilkan salam "Assalamu'alaikum, {nama}" + ringkasan hari ini | P0 |
| FR-DASH-02 | Menampilkan 4 KPI: Total Saldo Kas, Pemasukan Bulan Ini, Pengeluaran Bulan Ini, Total Santri Aktif | P0 |
| FR-DASH-03 | KPI Pemasukan menampilkan chip periode bulan berjalan; KPI Saldo & Pengeluaran menampilkan delta % vs periode sebelumnya | P0 |
| FR-DASH-04 | Menampilkan grafik batang pemasukan vs pengeluaran 6 bulan terakhir dengan filter periode | P0 |
| FR-DASH-05 | Menampilkan daftar tunggakan SPP: nama, kelas, nominal, durasi (bulan) — urut nominal/durasi | P0 |
| FR-DASH-06 | "Lihat Semua" pada tunggakan → halaman Santri dengan filter tunggakan | P1 |
| FR-DASH-07 | Menampilkan 5 transaksi terbaru (tanggal, deskripsi, kategori, jumlah, status) | P0 |
| FR-DASH-08 | "Tambah Transaksi" membuka modal pemasukan/pengeluaran; FAB muncul di mobile | P0 |
| FR-DASH-09 | Nilai KPI & grafik sinkron dengan data transaksi (update real-time setelah input) | P0 |

### FR-SANTRI — Manajemen Santri
| ID | Requirement | Prioritas |
|---|---|---|
| FR-SANTRI-01 | Menampilkan tabel santri: nama + avatar inisial + ID, kelas, wali + no HP, status SPP, aksi | P0 |
| FR-SANTRI-02 | Tambah santri via modal: nama lengkap, jenjang (TKA/TPA/TQA), kelas, nama wali, no HP wali, status | P0 |
| FR-SANTRI-03 | Edit data santri (modal terisi data lama) | P0 |
| FR-SANTRI-04 | Hapus santri dengan konfirmasi; hapus dibatalkan jika santri punya transaksi? → BR-04 | P0 |
| FR-SANTRI-05 | Filter: jenjang, kelas, status pembayaran + tombol filter | P0 |
| FR-SANTRI-06 | Pencarian nama/wali/ID (navbar, debounce) | P0 |
| FR-SANTRI-07 | Pagination dengan info "Menampilkan X-Y dari Z santri" | P0 |
| FR-SANTRI-08 | Lihat profil: detail santri + ringkasan (total lunas, tunggakan) + akses halaman SPP | P0 |
| FR-SANTRI-09 | ID santri dibuat otomatis (format tahun + nomor urut, mis. 2024001) | P1 |
| FR-SANTRI-10 | Statistik "Total Santri Aktif" + "+N Santri bulan ini" di header halaman | P1 |

### FR-SPP — Pembayaran SPP
| ID | Requirement | Prioritas |
|---|---|---|
| FR-SPP-01 | Halaman per santri menampilkan profil (foto/avatar, nama, kelas, ID, status Aktif) | P0 |
| FR-SPP-02 | Kartu ringkasan: Total Lunas (bulan) dan Tunggakan (bulan) | P0 |
| FR-SPP-03 | Kartu dark "Total Harus Dibayar": rincian tagihan per bulan + total nominal | P0 |
| FR-SPP-04 | Checklist 12 bulan: Lunas (hijau + centang), Tunggakan (merah + alert, pulse), Belum (abu-abu + jam) + legenda | P0 |
| FR-SPP-05 | Catat pembayaran: pilih bulan belum lunas → simpan → checklist & riwayat update | P0 |
| FR-SPP-06 | Nominal SPP mengikuti jenjang santri (pengaturan) | P0 |
| FR-SPP-07 | Riwayat pembayaran: no referensi (#TRX-xxxxx), tanggal, bulan SPP, nominal, status, aksi | P0 |
| FR-SPP-08 | Unduh kwitansi per pembayaran (format cetak) | P1 |
| FR-SPP-09 | "Cetak PDF" ekspor rekap SPP santri | P1 |
| FR-SPP-10 | Pembayaran dapat menutup beberapa bulan sekaligus (bulk) | P1 |

### FR-KAS — Pemasukan & Pengeluaran
| ID | Requirement | Prioritas |
|---|---|---|
| FR-KAS-01 | Ringkasan pemasukan: total bulan ini + delta %, total infaq & sedekah + jumlah donatur, % SPP lunas + progress bar | P0 |
| FR-KAS-02 | Ringkasan pengeluaran: total bulan ini + delta %, kategori terbesar + porsi %, sisa anggaran ops + tenggat | P0 |
| FR-KAS-03 | Tabel pemasukan: kategori (badge), sumber, jumlah, tanggal, catatan, aksi | P0 |
| FR-KAS-04 | Tabel pengeluaran: tanggal + jam, kategori, keterangan (truncate), thumbnail bukti, jumlah, aksi | P0 |
| FR-KAS-05 | Tambah pemasukan: kategori (SPP Santri, Donasi/Infaq, Sewa Aset, Lainnya), sumber, jumlah, tanggal, catatan | P0 |
| FR-KAS-06 | Tambah pengeluaran: tanggal, kategori (Operasional, Gaji/Honor, Perawatan, Lain-lain), jumlah, keterangan, unggah bukti (PNG/JPG ≤10MB) | P0 |
| FR-KAS-07 | Edit & hapus transaksi (hapus dengan konfirmasi; nominal/ringkasan ikut update) | P0 |
| FR-KAS-08 | Preview bukti pengeluaran via modal gambar | P1 |
| FR-KAS-09 | Filter kategori + periode (bulan/tahun) | P0 |
| FR-KAS-10 | Ekspor CSV sesuai filter aktif | P1 |
| FR-KAS-11 | Pencarian transaksi (deskripsi/keterangan/sumber) | P1 |
| FR-KAS-12 | Tabel pemasukan otomatis menerima transaksi dari pembayaran SPP (kategori "SPP Santri") | P0 |

### FR-LAPORAN — Laporan
| ID | Requirement | Prioritas |
|---|---|---|
| FR-LAP-01 | Grafik pemasukan vs pengeluaran per bulan + tabel rekap | P0 |
| FR-LAP-02 | Ringkasan per kategori (jumlah transaksi + total) | P1 |
| FR-LAP-03 | Rekap tunggakan per kelas/jenjang | P1 |
| FR-LAP-04 | Filter periode (bulan/tahun/semester) | P1 |
| FR-LAP-05 | Ekspor CSV | P1 |
| FR-LAP-06 | Cetak PDF laporan | P1 |

### FR-PENGATURAN — Pengaturan
| ID | Requirement | Prioritas |
|---|---|---|
| FR-SET-01 | Kelola profil TPQ (nama, alamat, identitas) | P1 |
| FR-SET-02 | Kelola nominal SPP per jenjang (TKA/TPA/TQA) — dipakai FR-SPP-06 | P0 |
| FR-SET-03 | Kelola daftar kategori pemasukan & pengeluaran | P1 |
| FR-SET-04 | Tentukan tahun ajaran aktif | P1 |

### FR-SISTEM — Umum
| ID | Requirement | Prioritas |
|---|---|---|
| FR-SYS-01 | Seluruh teks antarmuka Bahasa Indonesia (EYD) | P0 |
| FR-SYS-02 | Format nominal Rupiah konsisten (Rp, ribuan, tabular-nums) | P0 |
| FR-SYS-03 | Responsif: desktop (12 kolom), tablet (8), mobile (4) — sidebar drawer di mobile | P0 |
| FR-SYS-04 | Navigasi konsisten: 7 menu (Beranda, Santri, Pembayaran SPP, Pemasukan, Pengeluaran, Laporan, Pengaturan) | P0 |
| FR-SYS-05 | Pencarian global dari navbar | P1 |
| FR-SYS-06 | Notifikasi in-app: indikator dot + daftar (tunggakan, transaksi baru) | P2 |
| FR-SYS-07 | Dark mode (token siap; toggle) | P2 |

## 11. Non-Functional Requirements

### NFR-01 Performa
- Waktu muat halaman awal (dashboard) < 2 detik pada koneksi 4G (target Lighthouse LCP ≤ 2.5s).
- Operasi CRUD < 500ms setelah submit (umpan balik instan + toast).
- Tabel dengan 1.000+ baris tetap responsif (pagination server-side / virtualisasi bila perlu).

### NFR-02 Keamanan
- Password di-hash (bcrypt/argon2), tidak pernah disimpan plaintext.
- Semua mutasi data melalui validasi server-side (tidak hanya client).
- Proteksi route + otorisasi per aksi (peran).
- Upload bukti: validasi tipe & ukuran (PNG/JPG ≤10MB) di client dan server.
- Sesi aman (HttpOnly cookie / token), idle timeout.
- (V2) Rate-limit login, audit log.

### NFR-03 Keandalan & Integritas Data
- Setiap mutasi transaksi bersifat atomik; kegagalan setengah jalan di-rollback (mis. bayar SPP → gagal buat transaksi → tidak ada duplikat).
- Tidak ada penghapusan permanen yang menghilangkan jejak keuangan: hapus transaksi = soft delete atau wajib konfirmasi tegas (BR-05).
- Backup database terjadwal (V2).

### NFR-04 Kompatibilitas
- Browser modern: Chrome, Edge, Firefox, Safari (2 versi terakhir).
- Responsif penuh: ≥360px lebar layar.
- Print-friendly halaman kwitansi & laporan.

### NFR-05 Aksesibilitas (WCAG 2.1 AA dasar)
- Kontras teks memenuhi rasio minimum (token warna sudah dirancang).
- Semua elemen interaktif dapat diakses keyboard (focus ring terlihat).
- Modal: focus trap, Escape menutup, `role="dialog"`, `aria-modal`.
- Form: label terhubung ke input (`for`/`id`); error dibacakan.
- Alt text pada gambar bermakna.

### NFR-06 Maintainability
- Komponen reusable berbasis shadcn/ui (inventaris: `docs/COMPONENT_INVENTORY.md`).
- TypeScript strict; semua entitas punya tipe (santri, transaksi, pembayaran, pengaturan).
- Desain token-driven (warna/spacing/radius/shadow di Tailwind config — `docs/DESIGN_SYSTEM.md`).
- Setiap fase lulus gate: `lint` + `tsc --noEmit` + `build`.

### NFR-07 Skalabilitas (arah)
- V1: data lokal/tunggal TPQ (ribuan santri, puluhan ribu transaksi).
- V2: multi-device nyata + backup.
- V3: multi-cabang (pemisahan data per TPQ).

## 12. Business Rules

| ID | Rule | Keterangan |
|---|---|---|
| BR-01 | **Satu santri punya satu jenjang & satu kelas**; nominal SPP ditentukan jenjang (TKA/TPA/TQA) dari Pengaturan | Konsisten dengan filter Jenjang + Kelas |
| BR-02 | **Status SPP santri**: Lunas (tidak ada tagihan bulan berjalan), Tunggakan (≥1 bulan belum bayar, termasuk bulan berjalan) | Bulan berjalan yang belum dibayar dihitung tunggakan (lihat desain: AGU error/pulse) |
| BR-03 | **Pembayaran SPP otomatis menciptakan transaksi pemasukan** kategori "SPP Santri" dengan sumber = nama santri | FR-KAS-12; menjaga saldo kas konsisten |
| BR-04 | **Penghapusan santri**: santri dengan riwayat pembayaran/transaksi tidak bisa dihapus permanen — opsi: nonaktifkan (status "Tidak Aktif") | Melindungi jejak audit keuangan |
| BR-05 | **Penghapusan transaksi** hanya oleh pembuatnya (bendahara) / super admin; selalu dengan konfirmasi; saldo & ringkasan dihitung ulang | Konsistensi laporan |
| BR-06 | **Nominal transaksi > 0**; pengeluaran dicatat positif dengan tanda jenis "Keluar", bukan angka negatif | Desain menampilkan "-Rp" hanya sebagai tampilan |
| BR-07 | **No. referensi pembayaran** otomatis & unik: `#TRX-{nomor urut}` | Riwayat & kwitansi |
| BR-08 | **Saldo kas** = Σ pemasukan − Σ pengeluaran (tidak bisa negatif pada input normal; saldo negatif memicu peringatan) | KPI Beranda |
| BR-09 | **Delta %** dihitung vs periode sebelumnya (bulan lalu / periode sebanding); jika periode sebelumnya 0 → tampilkan "—" bukan pembagian oleh nol | KPI & BentoCard |
| BR-10 | **Tahun ajaran aktif** dari Pengaturan menentukan label checklist SPP (mis. 2024) | Checklist 12 bulan |
| BR-11 | **Format Rupiah**: `Rp 25.450.000` (spasi, tanpa desimal) untuk nominal ≥ 1.000; nilai kecil di kartu tunggakan boleh ringkas ("Rp 150k") sesuai desain beranda | Konsistensi visual |
| BR-12 | **Ulang tahun/aplikasi**: input tanggal transaksi tidak boleh di masa depan | Validasi |
| BR-13 | **Kategori default** (V1): Pemasukan — SPP Santri, Donasi/Infaq, Sewa Aset, Lainnya; Pengeluaran — Operasional, Gaji/Honor, Perawatan, Lain-lain. Dapat dikelola di Pengaturan | FR-SET-03 |

## 13. Error Handling

| # | Skenario | Pesan ke Pengguna (Bahasa Indonesia) | Perilaku Sistem |
|---|---|---|---|
| E1 | Login gagal (email/password salah) | "Email atau password salah." | Field tetap terisi, tidak bocorkan mana yang salah |
| E2 | Login gagal 3x berturut | "Terlalu banyak percobaan. Coba lagi dalam 5 menit." | Kunci sementara (rate-limit) |
| E3 | Sesi kedaluwarsa | "Sesi Anda berakhir. Silakan masuk kembali." | Redirect ke login, data form yang belum disimpan hilang (warning) |
| E4 | Submit form tanpa field wajib | "Field {label} wajib diisi." | Error inline merah di bawah field + border error; fokus ke field pertama |
| E5 | Jumlah ≤ 0 | "Jumlah harus lebih dari 0." | Block submit, error inline |
| E6 | Tanggal di masa depan | "Tanggal tidak boleh di masa depan." | Block submit |
| E7 | Format angka tidak valid | "Masukkan angka yang valid." | Block submit |
| E8 | Upload bukan gambar / >10MB | "File harus PNG/JPG maksimal 10MB." | Tolak file, tampilkan error di dropzone |
| E9 | Hapus data tanpa konfirmasi | — | Dialog konfirmasi muncul; tanpa "Ya" tidak ada aksi |
| E10 | Hapus santri ber-riwayat | "Santri memiliki riwayat pembayaran. Nonaktifkan saja?" | Opsi: Nonaktifkan / Batal (BR-04) |
| E11 | Gagal simpan (server error) | "Gagal menyimpan data. Coba lagi." | Toast error; data form dipertahankan; log error |
| E12 | Gagal muat data | "Gagal memuat data. Periksa koneksi Anda." | State kosong + tombol "Coba Lagi" |
| E13 | Data tidak ditemukan (ID rusak) | "Santri tidak ditemukan." | Halaman 404/empty state |
| E14 | Ekspor gagal | "Gagal mengekspor. Coba lagi." | Toast error |
| E15 | Tidak punya izin aksi | "Anda tidak memiliki izin untuk tindakan ini." | Tombol aksi disembunyikan; jika dipaksa via URL → pesan + redirect |
| E16 | Tabel kosong (tidak ada data) | "Belum ada data." + ikon | Empty state + tombol aksi utama (Tambah) |
| E17 | Pencarian tanpa hasil | "Tidak ada hasil untuk '{query}'." | Empty state tabel, filter tetap |
| E18 | Saldo negatif | "Peringatan: saldo kas negatif." | Badge peringatan di KPI saldo (warna error) |

## 14. Edge Cases

| # | Kasus | Penanganan |
|---|---|---|
| EC-01 | Santri pindah kelas/jenjang di tengah tahun | Ubah jenjang → nominal SPP baru berlaku bulan berikutnya; tagihan lama tidak diubah (BR-01) |
| EC-02 | Pembayaran SPP untuk bulan yang belum tiba (mis. bayar Desember di Agustus) | Diizinkan? **Kebijakan**: diperbolehkan (bayar di muka) — bulan ditandai Lunas; jika tidak diizinkan, pilihan bulan dibatasi sampai bulan berjalan. Keputusan: **diizinkan** (V1) |
| EC-03 | Pembayaran ganda bulan yang sama | Cegah: bulan yang sudah Lunas tidak bisa dibayar ulang; jika terlanjur (duplikat data) → entri kedua harus dihapus dengan konfirmasi + audit |
| EC-04 | Nominal SPP berubah di tengah tahun ajaran | Tagihan lama memakai nominal lama; transaksi tersimpan dengan nominal saat pembayaran (snapshot) |
| EC-05 | Dua bendahara input bersamaan (multi-user) | Last-write-wins V1 (data kecil); dokumentasikan risiko; optimistic locking V2 |
| EC-06 | Tahun ajaran berganti (Januari) | Checklist reset: bulan-bulan tahun lalu masuk riwayat; bulan baru status Belum |
| EC-07 | Santri keluar TPQ | Status "Tidak Aktif" (bukan hapus) — tetap tampil di laporan historis, hilang dari jumlah aktif |
| EC-08 | Tunggakan lintas tahun (bayar Juli 2024 di Januari 2025) | Tagihan tetap tercatat per bulan asal; checklist tahun berjalan menampilkan sisa |
| EC-09 | Bukti upload gagal sebagian (file rusak) | Validasi client + server; transaksi tanpa bukti tetap bisa disimpan (bukti opsional, peringatan) |
| EC-10 | Transaksi dibatalkan setelah bukti terupload | Hapus transaksi → bukti ikut terhapus (file orphan dihindari) |
| EC-11 | Nilai sangat besar (miliaran) | Format Rupiah tanpa desimal, tidak overflow (gunakan number aman / BigInt bila perlu) |
| EC-12 | Koneksi terputus saat submit | Simpan draft di form; saat kembali, tampilkan "Data belum tersimpan" + tawarkan ulang |
| EC-13 | Satu wali punya banyak anak santri | Daftar santri menampilkan per anak; pencarian wali menampilkan semua anaknya |
| EC-14 | Bulan berjalan belum ada transaksi apa pun | KPI menampilkan Rp 0, chip delta "—", grafik bar 0 — bukan error |
| EC-15 | Zona waktu berbeda (WIB default) | Semua tanggal disimpan lokal TPQ (Asia/Jakarta); tampilan konsisten |
| EC-16 | Santri baru didaftarkan di tengah bulan | Tagihan bulan berjalan otomatis tunggakan (BR-02) — bendahara bisa langsung catat pembayaran |
| EC-17 | Buka halaman SPP santri yang dihapus/nonaktif | Empty state "Santri tidak ditemukan" + tombol kembali |
| EC-18 | Filter kombinasi tanpa hasil | Empty state + tombol "Hapus Filter" |
| EC-19 | Periode laporan tanpa data | Grafik kosong + tabel kosong + pesan "Tidak ada transaksi pada periode ini" |
| EC-20 | Notifikasi menumpuk | V2: batas 50 notifikasi, tandai dibaca |

## 15. Acceptance Criteria

### AC-1 — Login & Keamanan
- [ ] AC1.1: User valid masuk ke Beranda sesuai peran; user invalid melihat "Email atau password salah".
- [ ] AC1.2: Semua route aplikasi tertutup; akses tanpa login → redirect login.
- [ ] AC1.3: Viewer tidak melihat tombol Tambah/Edit/Hapus di semua halaman.

### AC-2 — Beranda
- [ ] AC2.1: 4 KPI menampilkan nilai benar (saldo = Σ masuk − Σ keluar; pemasukan/pengeluaran bulan berjalan; santri aktif).
- [ ] AC2.2: Grafik menampilkan 6 bulan, 2 seri (hijau pemasukan, slate pengeluaran), filter periode berfungsi.
- [ ] AC2.3: Daftar tunggakan menampilkan nama, kelas, nominal, durasi; "Lihat Semua" menuju halaman santri.
- [ ] AC2.4: "Tambah Transaksi" membuka modal; FAB muncul hanya di viewport mobile.
- [ ] AC2.5: Setelah transaksi baru disimpan, KPI & grafik ter-update tanpa refresh manual.

### AC-3 — Santri
- [ ] AC3.1: Tabel menampilkan avatar inisial, ID, kelas (badge jenjang), wali + no HP, status SPP (dot), aksi hover.
- [ ] AC3.2: Tambah santri sukses → muncul di tabel, ID otomatis, statistik header bertambah.
- [ ] AC3.3: Edit menyimpan perubahan; validasi wajib isi nama/jenjang/kelas/wali.
- [ ] AC3.4: Hapus santri tanpa riwayat → konfirmasi → terhapus; dengan riwayat → opsi nonaktifkan.
- [ ] AC3.5: Filter jenjang/kelas/status + pencarian + pagination bekerja; info "Menampilkan X-Y dari Z".

### AC-4 — Pembayaran SPP
- [ ] AC4.1: Checklist 12 bulan menampilkan 3 status dengan warna & ikon sesuai desain (Lunas hijau, Tunggakan merah pulse, Belum abu).
- [ ] AC4.2: "Bayar Sekarang" → pilih bulan → simpan → bulan jadi Lunas, riwayat bertambah, saldo kas bertambah, transaksi pemasukan "SPP Santri" tercatat.
- [ ] AC4.3: Bulan yang sudah Lunas tidak bisa dibayar ulang.
- [ ] AC4.4: Nominal mengikuti jenjang santri.
- [ ] AC4.5: Kwitansi & "Cetak PDF" menghasilkan dokumen dengan data benar.

### AC-5 — Pemasukan & Pengeluaran
- [ ] AC5.1: Ringkasan (3 kartu) menghitung benar: total bulan ini + delta, infaq + donatur, % lunas + bar; pengeluaran: kategori terbesar + porsi, sisa anggaran.
- [ ] AC5.2: Tambah pemasukan valid → baris baru + ringkasan update + toast.
- [ ] AC5.3: Tambah pengeluaran dengan bukti (PNG/JPG ≤10MB) → thumbnail muncul; file invalid ditolak dengan pesan.
- [ ] AC5.4: Edit/hapus transaksi → ringkasan & saldo dihitung ulang.
- [ ] AC5.5: Filter kategori + periode dan ekspor CSV menghasilkan data sesuai filter.

### AC-6 — Laporan & Pengaturan
- [ ] AC6.1: Laporan menampilkan grafik + tabel rekap periode terpilih; ekspor CSV berisi data benar.
- [ ] AC6.2: Pengaturan: ubah nominal SPP jenjang → pembayaran baru memakai nominal baru.
- [ ] AC6.3: Kategori kustom muncul di dropdown form.

### AC-7 — Kualitas & Responsif
- [ ] AC7.1: Semua teks UI Bahasa Indonesia (EYD), tidak ada placeholder/string Inggris.
- [ ] AC7.2: Layout benar di 360px (mobile, sidebar drawer), 768px (tablet), 1280px (desktop) — tanpa scroll horizontal pada halaman utama.
- [ ] AC7.3: Modal dapat ditutup via Escape, klik backdrop, dan tombol X; fokus kembali ke elemen pemicu.
- [ ] AC7.4: Gate kualitas: lint, tsc, build hijau; halaman ≈ screenshot acuan `*/screen.png`.
- [ ] AC7.5: Lighthouse performance ≥ 90 (desktop), accessibility ≥ 90.

## 16. Roadmap

### V1 — Fondasi (MVP) — target: 6-8 minggu
Fokus: **bendahara mandiri mencatat & memantau keuangan satu TPQ.**

| Area | Deliverable |
|---|---|
| Autentikasi | Login/logout, proteksi route, 3 peran (Super Admin, Bendahara, Viewer) |
| Beranda | KPI, grafik tren 6 bulan, tunggakan, transaksi terbaru, FAB mobile |
| Santri | CRUD + filter + search + pagination + profil |
| SPP | Checklist 12 bulan, catat pembayaran, riwayat, kwitansi cetak |
| Pemasukan/Pengeluaran | CRUD + kategori + periode + bukti upload + ekspor CSV |
| Laporan | Rekap bulanan/tahunan + ekspor |
| Pengaturan | Profil TPQ, nominal SPP per jenjang, kategori, tahun ajaran |
| Kualitas | Responsif penuh, aksesibilitas dasar, gate lint/tsc/build |
| Data | Database (Prisma + Postgres/Neon) atau SQLite lokal — keputusan di Fase 10 rencana implementasi |

**Kriteria rilis V1**: AC-1 s.d. AC-7 lulus; bendahara bisa mencatat siklus SPP 1 bulan penuh tanpa bantuan pengembang.

### V2 — Keterlibatan & Skalabilitas — target: +6-8 minggu setelah V1
Fokus: **wali santri terlibat, data lebih aman.**

| Area | Deliverable |
|---|---|
| Portal Wali Santri | Login wali, lihat tagihan & status anak, riwayat, unduh kwitansi |
| Notifikasi | WhatsApp (WA API) / email: pengingat tagihan, konfirmasi pembayaran, info tunggakan |
| Pembayaran online (opsional) | Integrasi payment gateway (QRIS/transfer) — *keputusan bisnis* |
| Keamanan | Reset password email, rate-limit login, audit log (siapa mengubah apa & kapan) |
| Backup | Backup database terjadwal otomatis (Neon point-in-time / pg_dump cron) |
| Optimasi | Virtualisasi tabel besar, cache query, PWA (installable + offline ringan) |

### V3 — Multi-TPQ & Analitik — target: setelah V2 stabil
Fokus: **satu platform untuk banyak lembaga.**

| Area | Deliverable |
|---|---|
| Multi-cabang | Satu akun pengurus mengelola beberapa TPQ; pemisahan data ketat per TPQ |
| Role lanjutan | Kepala yayasan lintas-TPQ, bendahara per-cabang, wali lintas-anak |
| Analitik lanjutan | Perbandingan antar TPQ, prediksi arus kas, tren tunggakan per kelas |
| Integrasi | Ekspor ke akuntansi eksternal (Excel/QuickBooks), API publik untuk pengurus |
| Monetisasi (opsional) | Paket langganan per TPQ — *keputusan bisnis* |

---

## Lampiran

- **Definisi status**: Lunas = tagihan dibayar; Tunggakan = tagihan jatuh tempo belum dibayar; Proses = transaksi tercatat tapi belum final (desain chip kuning); Belum = bulan belum tiba/tagihan belum dibayar di masa depan.
- **Istilah**: TPQ = Taman Pendidikan Al-Qur'an; SPP = Sumbangan Pembinaan Pendidikan (iuran bulanan); TKA/TPA/TQA = jenjang (Paud / SD / SMP-SMA); KPI = kartu statistik utama.
- **Glosarium desain**: lihat `docs/DESIGN_SYSTEM.md` (token warna, tipografi, komponen).
