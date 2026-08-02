# USER_FLOW — TPQ Finance

Alur pengguna end-to-end per peran (ringkas dari PRD §8-9). Format: langkah → aksi → hasil.

## 1. Masuk & navigasi (semua peran)

```
Buka aplikasi → belum login? → /login
  → isi email+password → [Masuk]
     ├─ salah → "Email atau password salah." (tetap di login)
     └─ benar → /beranda (sidebar 7 menu)
```

Sidebar: Beranda · Santri · Pembayaran SPP · Pemasukan · Pengeluaran · Laporan · Pengaturan. Mobile: hamburger → drawer. Logout: menu user di bawah sidebar.

## 2. Bendahara — catat pembayaran SPP (alur inti)

1. **/santri** → cari santri (search navbar / filter) → klik nama / [Eye].
2. **/pembayaran-spp/[id]** → checklist 12 bulan: hijau = Lunas, merah berdenyut = Tunggakan, abu = Belum.
3. Wali bayar → **[Bayar Sekarang]** (kartu dark) → modal: pilih bulan + nominal (auto dari jenjang) → [Simpan].
4. Hasil: bulan jadi hijau ✓ · Riwayat +1 baris (#TRX-xxxxx) · saldo kas bertambah · transaksi "SPP Santri" masuk Pemasukan.
5. Unduh kwitansi (ikon download di riwayat) → print.

## 3. Bendahara — pemasukan donasi

1. **/pemasukan** → 3 kartu ringkasan (total bulan ini, infaq, % lunas).
2. **[Tambah Pemasukan]** → kategori (Donasi/Infaq) + sumber + jumlah + tanggal + catatan → [Simpan Data].
3. Baris baru di tabel · total kartu bertambah · toast sukses.
4. Akhir bulan → [Ekspor] → CSV riwayat.

## 4. Bendahara — pengeluaran + bukti

1. **/pengeluaran** → 3 kartu (total, kategori terbesar, sisa anggaran).
2. **[Tambah Pengeluaran]** → tanggal + kategori + jumlah + keterangan + unggah foto nota (≤10MB) → [Simpan Transaksi].
3. Baris + thumbnail bukti muncul; total ikut update.
4. Klik thumbnail → preview foto.

## 5. Pengasuh (Viewer) — pantau

1. Login → **/beranda**: KPI, grafik 6 bulan, tunggakan.
2. **/laporan** → rekap, pilih periode.
3. Tanpa tombol Tambah/Edit/Hapus/Ekspor (role viewer). Aksi via URL → 403 "Anda tidak memiliki izin."

## 6. Super Admin — kelola pengguna & pengaturan

1. **/pengaturan** → tab: Profil TPQ / SPP / Kategori / Pengguna.
2. SPP: ubah nominal per jenjang (TKA/TPA/TQA) → berlaku untuk pembayaran berikutnya (tagihan lama tak berubah).
3. Kategori: tambah kustom; kategori bawaan (SPP Santri, Operasional, dll.) tak bisa dihapus.
4. Pengguna: tambah bendahara/viewer, ubah role, nonaktifkan. Minimal 1 Super Admin; tak bisa nonaktifkan diri sendiri.

## 7. Kasus tepi (ringkas)

| Situasi | Yang terjadi |
|---|---|
| Bayar bulan yang sudah lunas | Ditolak: "Bulan ini sudah dibayar." |
| Bayar di muka (bulan depan) | Diizinkan — bulan ditandai Lunas |
| Santri keluar TPQ | Status "Tidak Aktif" (bukan hapus); riwayat tetap |
| Hapus santri ber-riwayat | Ditawari nonaktifkan, bukan hapus |
| Saldo negatif | Peringatan di kartu Saldo Kas |
| Sesi basi (30+ menit idle) | Redirect ke login, data form hilang |
| Upload bukan PNG/JPG / >10MB | Ditolak dengan pesan |
