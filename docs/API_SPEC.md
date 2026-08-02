# API_SPEC — TPQ Finance

Semua mutasi = Server Actions (bukan REST). Hanya 3 route HTTP publik (wajib) + 2 pola pendukung. Detail pola action: `docs/ARCHITECTURE.md` §6.

---

## 1. HTTP Endpoints (Route Handlers)

### 1.1 `/api/auth/[...all]`

Endpoint Better Auth. `GET` + `POST` → `auth.handler` (login, logout, session, dll.). Publik.

### 1.2 `GET /api/export/[jenis]`

Unduh CSV. `jenis` = `pemasukan` | `pengeluaran` | `laporan`.

- Auth: sesi wajib; `requireRole(BENDAHARA, SUPER_ADMIN)` — viewer → 403 (PRD FR-AUTH-04).
- Query params (filter aktif, opsional):
  - `periode` = `YYYY-MM` (bulan) | `YYYY` (tahun) — filter `tanggal`
  - `kategoriId` = UUID
  - `q` = teks pencarian (sumber/keterangan, ILIKE)
- Respon: `200` `text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="pemasukan-2024-08.csv"`, BOM `\uFEFF` (Excel), baris `\r\n`, escape `"` → `""`.
- Efek samping: audit `EXPORT` (detail: jenis + filter).
- Error: 401 (tanpa sesi), 403 (viewer), 404 (jenis tak dikenal).

### 1.3 `GET /api/bukti/[id]`

Signed URL bukti pengeluaran (bucket privat).

- Auth: sesi wajib (role apa pun yang bisa lihat tabel).
- Logic: cari `Transaksi.buktiUrl` → `supabase.storage.from("bukti").createSignedUrl(path, 3600)` → `302` redirect ke URL.
- Error: 404 (transaksi/bukti tak ada), 401.

---

## 2. Server Actions (mutasi)

Pola wajib tiap action (dari `src/actions/transaksi.ts` template):
`requireRole(...)` → zod parse `FormData` → `$transaction` (mutasi + `audit()`) → `revalidatePath` + `revalidateTag("dashboard")` → return `FormState`.

`FormState` = `{ ok: boolean; pesan?: string; errors?: Record<field, string> }`.

### 2.1 `actions/auth.ts`
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `login(prev, formData)` | email, password | publik | wrap `auth.api.signInEmail`; error "Email atau password salah." (E1) |
| `logout()` | — | sesi | wrap auth signOut; audit LOGOUT |

### 2.2 `actions/santri.ts`
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `tambahSantri` | nama*, jenjang*, kelas*, namaWali*, noHpWali, keterangan | BENDAHARA+ | noInduk auto `{tahun}{urut}`; audit CREATE |
| `editSantri` | id, ...sama | BENDAHARA+ | audit UPDATE (before/after) |
| `hapusSantri` | id | BENDAHARA+ | punya pembayaran → dialog nonaktifkan (E10); else soft delete |
| `nonaktifkanSantri` | id | BENDAHARA+ | status TIDAK_AKTIF (EC-07) |

### 2.3 `actions/pembayaran.ts`
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `catatPembayaranSpp` | santriId, bulan*, nominal, metode | BENDAHARA+ | **atomik**: create Pembayaran (snapshot rate) + create Transaksi (PEMASUKAN, kategori "SPP Santri", sumber=nama santri) + audit; unique (tenantId, santriId, bulan) → "Bulan ini sudah dibayar." (EC-03) |
| `batalkanPembayaran` | id | BENDAHARA+ | status DIBATALKAN + soft-delete Transaksi terkait, atomik |

### 2.4 `actions/transaksi.ts`
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `tambahPemasukan` | kategoriId*, sumber, jumlah*, tanggal*, catatan | BENDAHARA+ | CHECK `jumlah > 0`, `tanggal <= now()` (BR-12) |
| `tambahPengeluaran` | kategoriId*, jumlah*, tanggal*, keterangan, bukti (File) | BENDAHARA+ | validasi PNG/JPG ≤10MB → upload Supabase → simpan path |
| `editTransaksi` | id, ...sama | BENDAHARA+ | audit UPDATE |
| `hapusTransaksi` | id | BENDAHARA+ | soft delete + audit; ringkasan ikut update |

### 2.5 `actions/kategori.ts` / `actions/pengaturan.ts`
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `tambahKategori` | jenis, nama | BENDAHARA+ | unique (tenantId, jenis, nama) |
| `hapusKategori` | id | BENDAHARA+ | `isDefault` → tolak (C11); dipakai transaksi → tolak (FK Restrict) |
| `simpanSppRate` | jenjang, nominal, tahunAjaran | BENDAHARA+ | unique (tenantId, jenjang, tahunAjaran); nominal baru berlaku pembayaran berikutnya (snapshot, EC-04) |
| `simpanProfilTpq` | namaTpq, alamat | BENDAHARA+ | Pengaturan KV `profil.*` |
| `simpanTahunAjaran` | tahunAjaran | BENDAHARA+ | Pengaturan KV `tahunAjaranAktif` |

### 2.6 `actions/user.ts` (Super Admin)
| Action | Param | Izin | Catatan |
|---|---|---|---|
| `tambahUser` | nama, email, role | SUPER_ADMIN | create via Better Auth; audit |
| `ubahRole` | userId, role | SUPER_ADMIN | C12: minimal 1 SUPER_ADMIN |
| `nonaktifkanUser` | userId | SUPER_ADMIN | tak bisa diri sendiri (C12) |

---

## 3. Kontrak data

### Transaksi (dibuat/read)
```ts
type TransaksiDTO = {
  id: string; jenis: "PEMASUKAN" | "PENGELUARAN";
  kategoriId: string; kategoriNama: string;
  sumber: string | null; keterangan: string | null;
  jumlah: number;            // Decimal → number (jumlah >= 0, arah via jenis)
  tanggal: string;           // ISO, tampil formatTanggal()
  status: "LUNAS" | "PROSES" | "DIBATALKAN";
  buktiUrl: string | null;
  createdAt: string;
};
```

### Pembayaran SPP
```ts
type PembayaranDTO = {
  id: string; santriId: string; transaksiId: string;
  noReferensi: string;       // "#TRX-88210"
  bulan: string;             // ISO "2024-08-01"
  nominal: number;           // snapshot
  status: "LUNAS" | "DIBATALKAN";
  metode: "TUNAI" | "TRANSFER";
  paidAt: string;
};
```

### Ringkasan dashboard
```ts
type RingkasanDTO = {
  saldoKas: number; pemasukanBulanIni: number; pengeluaranBulanIni: number;
  deltaPemasukan: number | null;   // % vs bulan lalu; null = tak ada basis (BR-09)
  deltaPengeluaran: number | null;
  santriAktif: number; santriBaruBulanIni: number;
  tunggakan: { santriId: string; nama: string; kelas: string; total: number; durasiBulan: number }[];
};
```

### Error & validasi (zod — `src/lib/validations.ts`)
- `jumlah`: `z.coerce.number().positive().max(99_000_000_000_000)` — pesan "Jumlah harus lebih dari 0." (E5)
- `tanggal`: `z.coerce.date().max(new Date())` — "Tanggal tidak boleh di masa depan." (E6)
- `email`: `z.email()` · `password`: `min(8)` · `nama*`: `min(1)`
- File: `z.instanceof(File)` + cek `type in ["image/png","image/jpeg"]` + `size <= 10MB` — "File harus PNG/JPG maksimal 10MB." (E8)

---

## 4. Error codes (HTTP saja)

| Kode | Makna | Pesan UI |
|---|---|---|
| 401 | Tanpa sesi / sesi basi | redirect `/login` ("Sesi Anda berakhir." E3) |
| 403 | Role tak berizin | "Anda tidak memiliki izin untuk tindakan ini." (E15) |
| 404 | Data/jenis tak ditemukan | "Data tidak ditemukan." / empty state |
| 500 | Error server | "Gagal memuat data. Periksa koneksi Anda." (E12) + log |
