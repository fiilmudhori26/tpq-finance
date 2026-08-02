# DATABASE — TPQ Finance
**Desain Database (PostgreSQL + Prisma ORM)**

| | |
|---|---|
| DBMS | PostgreSQL |
| ORM | Prisma (versi stabil terbaru) |
| Basis | `docs/PRD.md` (BR-01..13, EC-01..20, FR) |
| Status | Desain — migration BELUM dibuat |
| Dokumen terkait | `docs/DESIGN_SYSTEM.md`, `docs/PAGE_SPECIFICATIONS.md`, `docs/IMPLEMENTATION_PLAN.md` |

Prinsip desain:
- **Uang = `Decimal(14,0)`** (rupiah tanpa desimal; aman sampai 99 triliun — PRD EC-11). Bukan `Int` (overflow Rp 2,1 M), bukan `Float` (presisi).
- **Soft delete** pada semua tabel bisnis (PRD BR-04/BR-05) — `deletedAt` nullable.
- **Snapshot nominal** pada pembayaran (PRD EC-04): ubah nominal SPP tidak mengubah transaksi lama.
- **Tenant-aware sejak awal** (PRD V3): kolom `tenantId` + unique constraint komposit di semua tabel bisnis — biaya 1 kolom sekarang, hemat migrasi besar nanti.
- **Kunci keuangan via constraint DB, bukan kode aplikasi** (positive-money CHECK, anti-duplikat bulan UNIQUE).

---

## 1. ERD

```
┌────────────────────────────┐          ┌────────────────────────────┐
│           TENANT           │1        N│           USER             │
│ id PK                      ├──────────┤ id PK                      │
│ nama, slug, alamat, status │          │ tenantId FK ──────────────┘
│ createdAt, updatedAt       │          │ nama, email UQ, passwordHash│
└──────────┬─────────────────┘          │ role ENUM, status,         │
           │                            │ lastLoginAt, deletedAt     │
           │ 1                          └─────────────┬──────────────┘
           │ N                                       │ 1
           ▼                                         ▼ N
┌────────────────────────────┐          ┌────────────────────────────┐
│          SANTRI            │1        N│        TRANSAKSI           │
│ id PK                      ├──────────┤ id PK                      │
│ tenantId FK ───────────────┘          │ tenantId FK ───────────────┘
│ noInduk UQ(tenant), nama,            │ jenis ENUM                 │
│ jenjang ENUM, kelas, namaWali,       │ kategoriId FK ──────────────┐
│ noHpWali, status, deletedAt          │ sumber, keterangan          │
└──────────┬─────────────────┘          │ jumlah DECIMAL(14,0) > 0   │
           │ 1                         │ tanggal DateTime           │
           │ N                         │ status ENUM, buktiUrl      │
           ▼                           │ createdById FK (User)      │
┌────────────────────────────┐          │ deletedAt                  │
│        PEMBAYARAN          │          └────────────┬───────────────┘
│ id PK                      │                       │ 1
│ tenantId FK ───────────────┘                       │
│ santriId FK ───────────────┘                       │
│ transaksiId FK UQ (1:1) ───────────────────────────┘ (transaksi
│ noReferensi UQ (#TRX-xxx)                            pemasukan "SPP
│ bulan Date (awal bulan)                              Santri" yang
│ nominal DECIMAL(14,0)  ← snapshot rate              dibuat otomatis)
│ status ENUM, metode ENUM, paidAt                   BR-03
│ createdById FK (User)
│ deletedAt
└──────────┬─────────────────┘
           │ 1
           ▼ N
┌────────────────────────────┐          ┌────────────────────────────┐
│        KATEGORI            │1        N│        SPP_RATE           │
│ id PK                      ├──────────┤ id PK                      │
│ tenantId FK ───────────────┘ (transaksi│ tenantId FK ──────────────┘
│ jenis ENUM (MASUK/KELUAR)  │  memakai  │ jenjang ENUM              │
│ nama UQ(tenant,jenis,nama) │  kategori │ nominal DECIMAL(14,0)     │
│ isDefault, deletedAt       │           │ tahunAjaran UQ(tenant,    │
└────────────────────────────┘           │             jenjang,thn)   │
                                         │ deletedAt                  │
┌────────────────────────────┐          └────────────────────────────┘
│        PENGATURAN          │
│ id PK                      │          ┌────────────────────────────┐
│ tenantId FK ───────────────┘          │        AUDIT_LOG          │
│ key UQ(tenant,key), value Json│       │ id PK                      │
│ updatedAt                  │          │ tenantId FK ───────────────┘
└────────────────────────────┘          │ userId FK NULL (SetNull)   │
                                         │ aksi ENUM, entitas,        │
                                         │ entitasId, detail Json     │
                                         │ createdAt                  │
                                         │ (append-only, TANPA        │
                                         │  delete/soft-delete)       │
                                         └────────────────────────────┘
```

Catatan: **Tenant 1—N semua tabel** (User, Santri, Kategori, Transaksi, Pembayaran, SppRate, Pengaturan, AuditLog) — garis dihilangkan dari diagram demi keterbacaan.

## 2. Relasi Antar Tabel

| # | Dari | Ke | Kardinalitas | Kolom FK | onDelete | Keterangan |
|---|---|---|---|---|---|---|
| R1 | User | Tenant | N : 1 | `User.tenantId` | **Restrict** | User tidak bisa hidup tanpa tenant |
| R2 | Santri | Tenant | N : 1 | `Santri.tenantId` | Restrict | — |
| R3 | Kategori | Tenant | N : 1 | `Kategori.tenantId` | Restrict | — |
| R4 | Transaksi | Tenant | N : 1 | `Transaksi.tenantId` | Restrict | — |
| R5 | Transaksi | Kategori | N : 1 | `Transaksi.kategoriId` | **Restrict** | Kategori dengan transaksi tak bisa dihapus |
| R6 | Transaksi | User | N : 1 | `Transaksi.createdById` | **Restrict** | Jejak pembuat transaksi wajib utuh (BR-05) |
| R7 | Pembayaran | Tenant | N : 1 | `Pembayaran.tenantId` | Restrict | — |
| R8 | Pembayaran | Santri | N : 1 | `Pembayaran.santriId` | **Restrict** | Riwayat pembayaran santri tidak ikut hilang |
| R9 | Pembayaran | Transaksi | **1 : 1** | `Pembayaran.transaksiId` (unique) | **Restrict** | Transaksi SPP yang dibuat otomatis (BR-03); anti-duplikat |
| R10 | Pembayaran | User | N : 1 | `Pembayaran.createdById` | Restrict | Pencatat pembayaran |
| R11 | SppRate | Tenant | N : 1 | `SppRate.tenantId` | Restrict | — |
| R12 | Pengaturan | Tenant | N : 1 | `Pengaturan.tenantId` | Restrict | — |
| R13 | AuditLog | Tenant | N : 1 | `AuditLog.tenantId` | Restrict | Jejak audit wajib utuh |
| R14 | AuditLog | User | N : 1 | `AuditLog.userId` | **SetNull** | User dihapus → log tetap ada, userId NULL |

Aturan `onDelete`:
- **Restrict** untuk semua FK keuangan (BR-04/BR-05, integritas jejak audit) — hapus dilakukan lewat **soft delete** (kolom `deletedAt`), bukan `DELETE` fisik.
- **SetNull** hanya `AuditLog.userId` — log tidak boleh hilang walau user terhapus.

Tidak ada FK `AuditLog.entitasId` (polimorfik: string nama entitas + id) — lihat §9.

## 3. Penjelasan Setiap Tabel

| Tabel | Tujuan | Asal PRD |
|---|---|---|
| `Tenant` | Entitas lembaga (TPQ). V1: 1 baris dibuat saat setup. V3: multi-TPQ. | V3, §6.2 |
| `User` | Akun pengguna sistem: Super Admin, Bendahara, Viewer (+ Wali V2). | §5, F1 |
| `Santri` | Data pokok santri yang relevan untuk keuangan: jenjang, kelas, wali, status. | F3, BR-01 |
| `Kategori` | Daftar kategori transaksi (pemasukan & pengeluaran), dapat dikelola di Pengaturan. Seed 4+4 default (BR-13). | FR-SET-03, BR-13 |
| `Transaksi` | Catatan kas: pemasukan & pengeluaran. Satu tabel untuk dua jenis (kolom `jenis`), karena bentuknya identik. | F5, F6 |
| `Pembayaran` | Pembayaran SPP per santri per bulan. **Membuat 1 Transaksi pemasukan otomatis** (BR-03) via `transaksiId` 1:1. | F4, BR-03 |
| `SppRate` | Nominal SPP per jenjang per tahun ajaran. Dipakai untuk prefill tagihan; **nilai di-snapshot ke `Pembayaran.nominal`**. | FR-SET-02, EC-04 |
| `Pengaturan` | Key-value untuk profil TPQ (nama, alamat) + tahun ajaran aktif + konfigurasi lain. | F8 |
| `AuditLog` | Jejak append-only semua mutasi & peristiwa keamanan. | §9, NFR-02, V2 |

Kenapa bukan tabel terpisah `Pemasukan` & `Pengeluaran`? Keduanya punya field identik (kategori, sumber/keterangan, jumlah, tanggal, catatan, bukti, status, aksi). Satu tabel + enum `jenis` = setengah schema, satu set query, dan laporan pemasukan-vs-pengeluaran jadi `GROUP BY jenis` sederhana.

## 4. Penjelasan Setiap Kolom

### 4.1 `Tenant`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| nama | String(100) | NOT NULL | Nama TPQ ("TPQ Al-Hidayah") |
| slug | String(50) | UNIQUE NOT NULL | Identitas URL/per-tenant ("tpq-al-hidayah") |
| alamat | String(255) | NULL | Alamat lembaga |
| status | `StatusTenant` | NOT NULL default AKTIF | AKTIF / NONAKTIF |
| createdAt / updatedAt | DateTime | NOT NULL | Otomatis Prisma |

### 4.2 `User`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | Pemilik lembaga (R1) |
| nama | String(100) | NOT NULL | Nama tampilan |
| email | String(150) | UNIQUE NOT NULL | Login; lowercase di app |
| passwordHash | String(255) | NOT NULL | bcrypt/argon2 — **tidak pernah plaintext** (NFR-02) |
| role | `Role` | NOT NULL default BENDAHARA | SUPER_ADMIN / BENDAHARA / VIEWER (+ WALI V2) |
| status | `StatusUser` | NOT NULL default AKTIF | AKTIF / NONAKTIF (nonaktif = tak bisa login) |
| lastLoginAt | DateTime | NULL | Untuk display & deteksi idle |
| avatarUrl | String(255) | NULL | Foto profil |
| deletedAt | DateTime | NULL | Soft delete (BR-04) |
| createdAt / updatedAt | DateTime | NOT NULL | — |

### 4.3 `Santri`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R2) |
| noInduk | String(20) | UNIQUE **(tenantId, noInduk)** | Auto: "2024001" (tahun + urut, FR-SANTRI-09). Dibuat app dalam transaksi DB |
| nama | String(100) | NOT NULL | Nama lengkap santri |
| jenjang | `Jenjang` | NOT NULL | TKA / TPA / TQA — penentu nominal SPP (BR-01) |
| kelas | String(50) | NOT NULL | "Alif", "Ba", "B-2", dst. |
| namaWali | String(100) | NULL | Nama wali (bisa kosong saat pendaftaran?) → wajib diisi di form (FR-SANTRI-02), DB boleh NULL |
| noHpWali | String(20) | NULL | Nomor HP wali, format lokal |
| status | `StatusSantri` | NOT NULL default AKTIF | AKTIF / TIDAK_AKTIF (keluar TPQ — EC-07, BR-04) |
| keterangan | String(255) | NULL | Catatan opsional |
| deletedAt | DateTime | NULL | Soft delete |
| createdAt / updatedAt | DateTime | NOT NULL | — |

### 4.4 `Kategori`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R3) |
| jenis | `JenisKategori` | NOT NULL | PEMASUKAN / PENGELUARAN |
| nama | String(50) | UNIQUE **(tenantId, jenis, nama)** | "SPP Santri", "Operasional", dst. |
| isDefault | Boolean | NOT NULL default false | Kategori seed (BR-13) **tidak bisa dihapus** — transaksi SPP otomatis bergantung padanya |
| deletedAt | DateTime | NULL | Soft delete (kategori kustom saja) |
| createdAt / updatedAt | DateTime | NOT NULL | — |

Seed (BR-13): Pemasukan — `SPP Santri (isDefault)`, `Donasi/Infaq`, `Sewa Aset`, `Lainnya`. Pengeluaran — `Operasional`, `Gaji/Honor`, `Perawatan`, `Lain-lain`.

### 4.5 `Transaksi`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R4) |
| jenis | `JenisTransaksi` | NOT NULL | PEMASUKAN / PENGELUARAN |
| kategoriId | String(36) | FK → Kategori, NOT NULL | (R5); kategori wajib (FR-KAS-05/06) |
| sumber | String(150) | NULL | Nama pengirim/donatur/toko; untuk SPP otomatis = nama santri (BR-03) |
| keterangan | String(500) | NULL | Catatan ("SPP Juli & Agustus", "Bayar listrik Oktober") |
| jumlah | Decimal(14,0) | NOT NULL, **CHECK > 0** | Positif selalu (BR-06); arah ditentukan `jenis`, bukan tanda minus |
| tanggal | DateTime | NOT NULL | Waktu transaksi; pengeluaran menampilkan jam (14:30 WIB). **Tidak boleh masa depan** (BR-12) |
| status | `StatusTransaksi` | NOT NULL default LUNAS | LUNAS / PROSES / DIBATALKAN (chip kuning "Proses" di beranda) |
| buktiUrl | String(255) | NULL | Path file bukti (nota/struk) — PNG/JPG ≤10MB (FR-KAS-06) |
| createdById | String(36) | FK → User, NOT NULL | Pencatat (R6) |
| deletedAt | DateTime | NULL | Soft delete (BR-05) |
| createdAt / updatedAt | DateTime | NOT NULL | — |

### 4.6 `Pembayaran`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R7) |
| santriId | String(36) | FK → Santri, NOT NULL | (R8) |
| transaksiId | String(36) | FK → Transaksi, **UNIQUE**, NOT NULL | Transaksi pemasukan "SPP Santri" hasil BR-03; 1:1 anti-duplikat (R9) |
| noReferensi | String(20) | UNIQUE NOT NULL | "#TRX-88210" (BR-07) — auto, urut per tenant |
| bulan | Date | NOT NULL, **UNIQUE (tenantId, santriId, bulan)** | Bulan SPP yang dibayar (tanggal 1 bulan tsb). UNIQUE = cegah bayar ganda (EC-03) |
| nominal | Decimal(14,0) | NOT NULL, **CHECK > 0** | **Snapshot** rate saat bayar (EC-04) — tak berubah walau SppRate diedit |
| status | `StatusPembayaran` | NOT NULL default LUNAS | LUNAS / DIBATALKAN |
| metode | `MetodePembayaran` | NOT NULL default TUNAI | TUNAI / TRANSFER (+ QRIS V2) |
| paidAt | DateTime | NOT NULL | Saat dibayar (≠ `bulan` tagihan) |
| createdById | String(36) | FK → User, NOT NULL | (R10) |
| catatan | String(255) | NULL | Opsional |
| deletedAt | DateTime | NULL | Soft delete |
| createdAt / updatedAt | DateTime | NOT NULL | — |

### 4.7 `SppRate`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R11) |
| jenjang | `Jenjang` | NOT NULL | TKA / TPA / TQA |
| nominal | Decimal(14,0) | NOT NULL, **CHECK > 0** | Nominal bulanan jenjang ini |
| tahunAjaran | String(9) | UNIQUE **(tenantId, jenjang, tahunAjaran)** | "2024/2025" (BR-10) |
| deletedAt | DateTime | NULL | Soft delete |
| createdAt / updatedAt | DateTime | NOT NULL | — |

### 4.8 `Pengaturan`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R12) |
| key | String(50) | UNIQUE **(tenantId, key)** | `profil.namaTpq`, `profil.alamat`, `tahunAjaranAktif`, `notifikasi.enabled`, dst. |
| value | Json | NOT NULL | Nilai fleksibel (string/bool/objek) |
| updatedAt | DateTime | NOT NULL | (createdAt tidak perlu — key-value) |

`ponytail:` KV generik menggantikan tabel `ProfilTpq` + `Konfigurasi` + `TahunAjaran` terpisah — 1 tabel untuk semua pengaturan. Pecah jadi tabel khusus jika >20 key atau butuh relasi/riwayat.

### 4.9 `AuditLog`

| Kolom | Tipe | Constraint | Keterangan |
|---|---|---|---|
| id | String(36) | PK | UUID |
| tenantId | String(36) | FK → Tenant, NOT NULL | (R13) |
| userId | String(36) | FK → User, **NULL, SetNull** | Pelaku; NULL jika user terhapus (R14) |
| aksi | `AksiAudit` | NOT NULL | CREATE / UPDATE / DELETE / LOGIN / LOGOUT / EXPORT |
| entitas | String(30) | NOT NULL | Nama model: "Santri", "Transaksi", "Pembayaran", "User" |
| entitasId | String(36) | NOT NULL | Id baris (tanpa FK — polimorfik) |
| detail | Json | NOT NULL | Snapshot before/after untuk UPDATE; metadata lain (IP, filter ekspor) |
| createdAt | DateTime | NOT NULL | Waktu kejadian |

## 5. Enum

| Enum | Nilai | Dipakai di | Catatan |
|---|---|---|---|
| `Role` | `SUPER_ADMIN`, `BENDAHARA`, `VIEWER` | User.role | `WALI` ditambahkan V2 (portal wali) |
| `StatusUser` | `AKTIF`, `NONAKTIF` | User.status | NONAKTIF = tak bisa login |
| `StatusTenant` | `AKTIF`, `NONAKTIF` | Tenant.status | V3 |
| `Jenjang` | `TKA`, `TPA`, `TQA` | Santri.jenjang, SppRate.jenjang | Paud / SD / SMP-SMA (FR-SANTRI-02) |
| `StatusSantri` | `AKTIF`, `TIDAK_AKTIF` | Santri.status | EC-07: keluar TPQ = TIDAK_AKTIF, bukan hapus |
| `JenisKategori` | `PEMASUKAN`, `PENGELUARAN` | Kategori.jenis | — |
| `JenisTransaksi` | `PEMASUKAN`, `PENGELUARAN` | Transaksi.jenis | Satu tabel kas |
| `StatusTransaksi` | `LUNAS`, `PROSES`, `DIBATALKAN` | Transaksi.status | Chip beranda: hijau Lunas, kuning Proses (acuan) |
| `StatusPembayaran` | `LUNAS`, `DIBATALKAN` | Pembayaran.status | DIBATALKAN = void (BR-05, dengan audit) |
| `MetodePembayaran` | `TUNAI`, `TRANSFER` | Pembayaran.metode | `QRIS`/`VA` V2 (payment gateway) |
| `AksiAudit` | `CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`, `EXPORT` | AuditLog.aksi | — |

Catatan Prisma: enum didukung native; nama enum di schema = `Role`, `Jenjang`, dll. (huruf besar sesuai konvensi Prisma).

## 6. Index

### 6.1 Unique (integritas bisnis — selain PK)

| Tabel | Kolom | Alasan |
|---|---|---|
| User | email | Login unik (global; tenant kecil, email global lebih simpel — `ponytail:` V3 multi-tenant besar → (tenantId, email)) |
| Tenant | slug | Identitas tenant |
| Santri | **(tenantId, noInduk)** | FR-SANTRI-09: nomor induk unik per TPQ |
| Kategori | **(tenantId, jenis, nama)** | Tak ada kategori ganda |
| Transaksi | — (PK cukup) | — |
| Pembayaran | **(tenantId, santriId, bulan)** | **EC-03: anti bayar SPP ganda bulan sama** |
| Pembayaran | noReferensi | BR-07 |
| Pembayaran | transaksiId | 1:1 dengan Transaksi (R9) |
| SppRate | **(tenantId, jenjang, tahunAjaran)** | Satu rate per jenjang per tahun ajaran |
| Pengaturan | **(tenantId, key)** | KV unik |

### 6.2 Non-unique (performa query umum)

| Tabel | Kolom | Query yang dilayani |
|---|---|---|
| Transaksi | (tenantId, **tanggal**) | Tabel riwayat + filter periode (FR-KAS-09, FR-LAP-04) |
| Transaksi | (tenantId, **jenis**, tanggal) | Laporan pemasukan vs pengeluaran (FR-LAP-01) |
| Transaksi | (tenantId, **kategoriId**) | Ringkasan per kategori (FR-LAP-02, FR-KAS-02) |
| Transaksi | (tenantId, **createdAt**) | "Transaksi Terbaru" beranda (FR-DASH-07) |
| Santri | (tenantId, **status**) | KPI "Total Santri Aktif" (FR-DASH-02) |
| Santri | (tenantId, **jenjang**) | Filter jenjang (FR-SANTRI-05) |
| Santri | (tenantId, **kelas**) | Filter kelas + rekap tunggakan per kelas (FR-LAP-03) |
| Pembayaran | (tenantId, **santriId**, createdAt) | Riwayat per santri (FR-SPP-07) |
| AuditLog | (tenantId, **entitas**, entitasId) | Jejak per baris data |
| AuditLog | (tenantId, **createdAt**) | Timeline log |

Semua index memimpin dengan `tenantId` — syarat multi-tenant (V3) dan isolasi query per lembaga sejak V1.

## 7. Constraint

| # | Tabel | Constraint | Tipe | Penegakan |
|---|---|---|---|---|
| C1 | Transaksi | `jumlah > 0` | CHECK | DB (migration SQL `@db.Check` — Prisma tidak mendukung syntax CHECK, tambah via SQL manual) |
| C2 | Transaksi | `tanggal <= now()` | CHECK | DB + validasi app (BR-12) |
| C3 | Pembayaran | `nominal > 0` | CHECK | DB |
| C4 | SppRate | `nominal > 0` | CHECK | DB |
| C5 | Pembayaran | `bulan` = tanggal 1 bulan tsb | App | Normalisasi app (`new Date(y, m, 1)`) |
| C6 | Pembayaran | `bulan` tidak masa depan? → **kebijakan EC-02: bayar di muka DIIZINKAN** → tanpa CHECK | — | Keputusan PRD |
| C7 | Pembayaran | `transaksiId` unik → 1:1 (R9) | UNIQUE FK | DB |
| C8 | Pembayaran | UNIQUE (tenantId, santriId, bulan) | UNIQUE | DB |
| C9 | Semua FK keuangan | `onDelete: Restrict` | FK | Prisma (§2) |
| C10 | Semua enum | Prisma enum (native PG) | ENUM | DB |
| C11 | Kategori `isDefault` | tidak bisa dihapus (soft maupun fisik) | App guard | Transaksi SPP otomatis butuh kategori "SPP Santri" (BR-03) |
| C12 | User.role SUPER_ADMIN | minimal 1 per tenant; tidak bisa dinonaktifkan diri sendiri | App guard | Cegah lembaga kehilangan akses |
| C13 | Santri TIDAK_AKTIF | tidak muncul di KPI aktif, tetap di laporan historis | App query | EC-07 |
| C14 | Transaksi kategori terhapus (soft) | transaksi lama tetap tampil (FK tidak diputus, kategori di-filter saat create saja) | App | — |

Catatan: Prisma belum mendukung `CHECK` di schema — ditulis manual di file migration pertama (SQL `ADD CONSTRAINT ... CHECK (jumlah > 0)`). Semua constraint DB lain (PK, FK, UNIQUE, enum) native Prisma.

## 8. Soft Delete

**Pola**: kolom `deletedAt DateTime?` di semua tabel bisnis — `User`, `Santri`, `Kategori`, `Transaksi`, `Pembayaran`, `SppRate`. `Tenant` & `AuditLog` tanpa (tenant pakai `status`; audit log **append-only, tidak pernah dihapus**).

**Alasan (dari PRD)**:
- BR-04: santri ber-riwayat tak boleh hilang → opsi nonaktif = `status TIDAK_AKTIF` + opsi hapus = soft delete.
- BR-05: hapus transaksi tetap menyisakan jejak → soft delete + audit log.

**Implementasi Prisma** (satu tempat, bukan di tiap query):
- Prisma **Client Extension** (middleware):
  - `$allModels` + `$use`-style params: query → tambah `deletedAt: null` pada `findMany`/`findFirst`/`count`.
  - `delete` → intercept jadi `update { deletedAt: now() }` (soft).
  - `deleteMany` → soft `updateMany`.
  - `findUnique` (transaksiId 1:1) → perlu `rejectOnNotFound` alternatif: pakai `findFirst` di extension agar filter soft ikut.
- Aksi delete fisik hanya via **admin script internal** (maintenance), bukan dari UI.

**Semantik per tabel**:
| Tabel | Soft delete berarti | Tampil di UI |
|---|---|---|
| Santri | Data hilang dari daftar; riwayat pembayaran utuh (FK Restrict) | Riwayat menampilkan nama snapshot? — **tidak**: nama tetap dibaca dari Santri (soft-deleted row masih ada), jadi riwayat tetap bernama |
| Transaksi | Hilang dari tabel & ringkasan (jumlah tak dihitung) | Tersembunyi; audit log menyimpan detail |
| Pembayaran | Hilang dari riwayat santri; **transaksi SPP terkait ikut soft-delete** (dalam 1 transaksi DB) | Tersembunyi |
| Kategori | Hilang dari dropdown; transaksi lama tetap tampil | — |
| User | Tak bisa login | — |
| SppRate | Tak terpakai lagi; rate lama tetap valid untuk pembayaran historis (snapshot) | — |

**Pembayaran → Transaksi (BR-03)**: buat keduanya dalam **satu transaksi DB** (Prisma `$transaction`) — gagal salah satu = rollback keduanya (NFR-03, atomic). Soft-delete pembayaran juga soft-delete transaksi terkait, atomik.

## 9. Audit Log

**Tabel**: `AuditLog` (lihat §4.9). **Append-only** — tidak ada update/delete/soft-delete.

**Apa yang dicatat**:
- Mutasi CRUD pada: Santri, Transaksi, Pembayaran, Kategori, SppRate, User, Pengaturan (V1: 3 teratas wajib — `ponytail:` log entitas lain menyusul bila perlu).
- Peristiwa: LOGIN (sukses + gagal), LOGOUT, EXPORT (filter yang dipakai).

**Cara mencatat** (app-level, bukan DB trigger — trigger di luar kontrol Prisma & sulit diuji):
```
audit(prisma, { tenantId, userId, aksi, entitas, entitasId, detail })
```
Dipanggil **di dalam `$transaction` yang sama** dengan mutasi → kalau mutasi gagal, log tak tertulis (konsisten).

**Isi `detail` (Json)**:
- CREATE: `{ data }` ringkas (field penting).
- UPDATE: `{ before, after }` (snapshot field berubah; V1: seluruh row).
- DELETE: `{ data }` (yang dihapus — jejak pemulihan).
- LOGIN: `{ sukses: true/false, ip, userAgent }`.
- EXPORT: `{ jenis: "CSV", filter: {...} }`.

**Pertumbuhan**: 1 baris per mutasi. TPQ skala kecil (puluhan ribu transaksi/tahun) → aman bertahun. `ponytail:` bila >1 juta baris/tahun → arsip partisi bulanan, tambah saat data membuktikan.

**Tidak termasuk**: log pembacaan (view) — mahal, jarang berguna untuk lembaga kecil. Tambah V2 jika tuntutan audit meningkat (NFR-02).

## 10. Multi Tenant

**Arsitektur**: **shared-schema** — satu database, semua tenant di tabel yang sama, dibedakan kolom `tenantId`. (Bukan database-per-tenant — mahal & sulit dioperasikan; bukan schema-per-tenant — migrasi Prisma jadi N kali.)

**V1 (sekarang — biaya hampir nol)**:
- Kolom `tenantId` di semua tabel bisnis + index memimpin `tenantId` (§6).
- Unique constraint komposit ber-tenant: `(tenantId, noInduk)`, `(tenantId, santriId, bulan)`, `(tenantId, jenjang, tahunAjaran)`, `(tenantId, key)`, `(tenantId, jenis, nama)`.
- Satu baris `Tenant` dibuat saat setup; `User.tenantId` diambil dari sesi login → semua query di-filter app-level (`where: { tenantId }`).
- Prisma Client Extension: `$extends` menambahkan `tenantId` otomatis dari konteks sesi ke setiap query — satu titik, bukan di tiap service (pola sama dengan soft delete).

**V3 (saat benar-benar multi-TPQ — PRD V3)**:
- **PostgreSQL Row-Level Security (RLS)**: `ENABLE ROW LEVEL SECURITY` per tabel + policy `tenant_id = current_setting('app.tenant_id')`. Lapisan keamanan kedua di bawah filter app (defense in depth).
- Sesi DB: `SET app.tenant_id = ...` dalam transaksi per-request (Prisma `$transaction` + `$executeRaw`).
- Catatan Prisma + RLS: Prisma tidak mengelola policy — migrasi SQL manual; `SUPER_ADMIN` lintas-tenant memakai `BYPASSRLS` atau sesi terpisah. Bila friction-nya tinggi, filter app-level yang sudah ada cukup — RLS opsional.
- `User.email` global unique cukup untuk V1; V3 → `(tenantId, email)` bila ada nama email sama antar TPQ.
- Data lintas tenant **tidak pernah** bocor lewat UI: semua query ber-tenant + audit log ber-tenant.

**Isolasi yang dijamin**:
1. Unique constraint komposit ber-tenant (DB) — integritas data.
2. Filter `tenantId` di setiap query (app) — pemisahan akses.
3. RLS (V3, opsional) — pertahanan kedua.

---

## Lampiran A — Referensi schema.prisma (ringkas)

`ponytail:` ini desain referensi — JANGAN dibuat file/migration sebelum instruksi. Model ditulis apa adanya (tanpa `@@map`/`@db.*` detail, enum per §5).

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql" url = env("DATABASE_URL") }

enum Role { SUPER_ADMIN BENDAHARA VIEWER }          // + WALI (V2)
enum StatusUser { AKTIF NONAKTIF }
enum StatusTenant { AKTIF NONAKTIF }
enum Jenjang { TKA TPA TQA }
enum StatusSantri { AKTIF TIDAK_AKTIF }
enum JenisKategori { PEMASUKAN PENGELUARAN }
enum JenisTransaksi { PEMASUKAN PENGELUARAN }
enum StatusTransaksi { LUNAS PROSES DIBATALKAN }
enum StatusPembayaran { LUNAS DIBATALKAN }
enum MetodePembayaran { TUNAI TRANSFER }            // + QRIS (V2)
enum AksiAudit { CREATE UPDATE DELETE LOGIN LOGOUT EXPORT }

model Tenant {
  id        String   @id @default(uuid())
  nama      String   @db.VarChar(100)
  slug      String   @unique @db.VarChar(50)
  alamat    String?  @db.VarChar(255)
  status    StatusTenant @default(AKTIF)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  users       User[]
  santris     Santri[]
  kategoris   Kategori[]
  transaksis  Transaksi[]
  pembayarans Pembayaran[]
  sppRates    SppRate[]
  pengaturans Pengaturan[]
  auditLogs   AuditLog[]
}

model User {
  id           String    @id @default(uuid())
  tenantId     String
  tenant       Tenant    @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  nama         String    @db.VarChar(100)
  email        String    @unique @db.VarChar(150)
  passwordHash String    @db.VarChar(255)
  role         Role      @default(BENDAHARA)
  status       StatusUser @default(AKTIF)
  lastLoginAt  DateTime?
  avatarUrl    String?   @db.VarChar(255)
  deletedAt    DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  transaksiDibuat Transaksi[] @relation("TransaksiCreator")
  pembayaranDibuat Pembayaran[] @relation("PembayaranCreator")
  auditLogs    AuditLog[]
}

model Santri {
  id        String      @id @default(uuid())
  tenantId  String
  tenant    Tenant      @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  noInduk   String      @db.VarChar(20)
  nama      String      @db.VarChar(100)
  jenjang   Jenjang
  kelas     String      @db.VarChar(50)
  namaWali  String?     @db.VarChar(100)
  noHpWali  String?     @db.VarChar(20)
  status    StatusSantri @default(AKTIF)
  keterangan String?    @db.VarChar(255)
  deletedAt DateTime?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  pembayarans Pembayaran[]
  @@unique([tenantId, noInduk])
  @@index([tenantId, status])
  @@index([tenantId, jenjang])
  @@index([tenantId, kelas])
}

model Kategori {
  id        String        @id @default(uuid())
  tenantId  String
  tenant    Tenant        @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  jenis     JenisKategori
  nama      String        @db.VarChar(50)
  isDefault Boolean       @default(false)
  deletedAt DateTime?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  transaksis Transaksi[]
  @@unique([tenantId, jenis, nama])
}

model Transaksi {
  id          String          @id @default(uuid())
  tenantId    String
  tenant      Tenant          @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  jenis       JenisTransaksi
  kategoriId  String
  kategori    Kategori        @relation(fields: [kategoriId], references: [id], onDelete: Restrict)
  sumber      String?         @db.VarChar(150)
  keterangan  String?         @db.VarChar(500)
  jumlah      Decimal         @db.Decimal(14, 0)
  tanggal     DateTime
  status      StatusTransaksi @default(LUNAS)
  buktiUrl    String?         @db.VarChar(255)
  createdById String
  createdBy   User            @relation("TransaksiCreator", fields: [createdById], references: [id], onDelete: Restrict)
  deletedAt   DateTime?
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  pembayaran  Pembayaran?
  @@index([tenantId, tanggal])
  @@index([tenantId, jenis, tanggal])
  @@index([tenantId, kategoriId])
  @@index([tenantId, createdAt])
}

model Pembayaran {
  id           String           @id @default(uuid())
  tenantId     String
  tenant       Tenant           @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  santriId     String
  santri       Santri           @relation(fields: [santriId], references: [id], onDelete: Restrict)
  transaksiId  String           @unique
  transaksi    Transaksi        @relation(fields: [transaksiId], references: [id], onDelete: Restrict)
  noReferensi  String           @unique @db.VarChar(20)
  bulan        DateTime         // tanggal 1 bulan SPP
  nominal      Decimal          @db.Decimal(14, 0)
  status       StatusPembayaran @default(LUNAS)
  metode       MetodePembayaran @default(TUNAI)
  paidAt       DateTime
  createdById  String
  createdBy    User             @relation("PembayaranCreator", fields: [createdById], references: [id], onDelete: Restrict)
  catatan      String?          @db.VarChar(255)
  deletedAt    DateTime?
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  @@unique([tenantId, santriId, bulan])
  @@index([tenantId, santriId, createdAt])
}

model SppRate {
  id          String  @id @default(uuid())
  tenantId    String
  tenant      Tenant  @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  jenjang     Jenjang
  nominal     Decimal @db.Decimal(14, 0)
  tahunAjaran String  @db.VarChar(9)   // "2024/2025"
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@unique([tenantId, jenjang, tahunAjaran])
}

model Pengaturan {
  id        String @id @default(uuid())
  tenantId  String
  tenant    Tenant @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  key       String @db.VarChar(50)
  value     Json
  updatedAt DateTime @updatedAt
  @@unique([tenantId, key])
}

model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Restrict)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  aksi      AksiAudit
  entitas   String   @db.VarChar(30)
  entitasId String   @db.VarChar(36)
  detail    Json
  createdAt DateTime @default(now())
  @@index([tenantId, entitas, entitasId])
  @@index([tenantId, createdAt])
}
```

## Lampiran B — Checklist sebelum migration

1. [ ] Tambah CHECK constraints via SQL manual di migration pertama: `jumlah > 0` (Transaksi), `nominal > 0` (Pembayaran, SppRate), `tanggal <= now()` (Transaksi).
2. [ ] Seed: 1 Tenant + 1 Super Admin + 8 Kategori default (BR-13) + SppRate per jenjang.
3. [ ] Prisma Client Extension: soft-delete filter + auto tenantId.
4. [ ] Prisma Client Extension: `delete` → soft, `deleteMany` → soft.
5. [ ] Helper `audit()` dipanggil dalam `$transaction` mutasi.
6. [ ] Pembayaran + Transaksi dibuat atomik dalam satu `$transaction`.
