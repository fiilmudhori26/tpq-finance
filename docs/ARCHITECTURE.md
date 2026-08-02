# ARCHITECTURE — TPQ Finance

| | |
|---|---|
| Stack | Next.js 15 (App Router) · TypeScript · Prisma · Supabase (Postgres + Storage) · Better Auth · Tailwind CSS · shadcn/ui |
| Basis | `docs/PRD.md`, `docs/DATABASE.md` (schema referensi), `docs/IMPLEMENTATION_PLAN.md` |
| Status | Desain — belum ada kode |

Prinsip: **server-first**. Komponen server + Server Actions untuk semua mutasi data; JavaScript client seminimal mungkin (interaksi UI saja). Satu sumber kebenaran = database; UI hanya render + kirim intent.

Delta dari `DATABASE.md` karena stack baru:
- **Postgres**: Supabase (pooler) sebagai host, bukan Neon. Schema Prisma identik (PostgreSQL sama).
- **Auth**: Better Auth menggantikan rencana NextAuth. Model `User` menyesuaikan konvensi Better Auth (lihat §3).
- **Upload bukti**: Supabase Storage menggantikan penyimpanan lokal.
- **PDF**: browser print (tanpa library).

---

## 1. Struktur Folder

```
tpq-finance/
├── prisma/
│   ├── schema.prisma          # model + enum (dari docs/DATABASE.md, disesuaikan §3)
│   └── seed.ts                # Tenant + Super Admin + 8 kategori default + SppRate
├── src/
│   ├── middleware.ts          # proteksi route ringan (cek cookie sesi) + redirect login
│   ├── app/
│   │   ├── layout.tsx         # root: font Geist, lang="id", ThemeProvider
│   │   ├── page.tsx           # redirect / → /beranda
│   │   ├── (auth)/
│   │   │   └── login/page.tsx # halaman login (publik)
│   │   ├── (app)/
│   │   │   ├── layout.tsx     # guard sesi + AppShell (Sidebar, Navbar, main)
│   │   │   ├── beranda/page.tsx
│   │   │   ├── santri/page.tsx
│   │   │   ├── santri/[id]/page.tsx          # profil santri (FR-SANTRI-08)
│   │   │   ├── pembayaran-spp/[id]/page.tsx  # checklist 12 bulan + riwayat
│   │   │   ├── pemasukan/page.tsx
│   │   │   ├── pengeluaran/page.tsx
│   │   │   ├── laporan/page.tsx
│   │   │   └── pengaturan/page.tsx
│   │   └── api/
│   │       ├── auth/[...all]/route.ts        # endpoint Better Auth
│   │       ├── export/[jenis]/route.ts       # download CSV (GET + auth)
│   │       └── bukti/[id]/route.ts           # signed URL preview bukti
│   ├── components/
│   │   ├── ui/                # shadcn/ui (button, card, dialog, ...)
│   │   ├── layout/            # app-shell, sidebar, navbar, page-header
│   │   └── features/          # stat-card, data-table, monthly-checklist,
│   │                          # arrears-list, finance-bar-chart, modal-form-*
│   ├── lib/
│   │   ├── db.ts              # PrismaClient + extension (soft delete, tenantId)
│   │   ├── auth.ts            # konfigurasi Better Auth (adapter Prisma, additionalFields)
│   │   ├── session.ts         # getSession(), requireRole(), requireTenant()
│   │   ├── supabase.ts        # admin client (service role, server-only)
│   │   ├── validations.ts     # schema zod semua form
│   │   ├── audit.ts           # helper audit() — dipanggil dalam $transaction
│   │   ├── format.ts          # formatRupiah(), formatTanggal()
│   │   ├── export.ts          # build CSV (Blob)
│   │   └── logger.ts          # logging server
│   ├── actions/               # Server Actions per domain
│   │   ├── auth.ts            # login/logout (bungkus Better Auth)
│   │   ├── santri.ts          # CRUD santri
│   │   ├── pembayaran.ts      # catat bayar SPP + riwayat
│   │   ├── transaksi.ts       # pemasukan & pengeluaran + upload bukti
│   │   ├── kategori.ts        # kelola kategori
│   │   └── pengaturan.ts      # profil TPQ, SppRate, tahun ajaran
│   └── types/                 # tipe turunan (DTO, hasil query)
├── .env / .env.local          # DATABASE_URL, BETTER_AUTH_SECRET, SUPABASE_*
└── docs/                      # PRD, DATABASE, ARCHITECTURE, DESIGN, dll.
```

Aturan: **folder fitur, bukan folder tipe**. Tiap domain punya 1 file actions + komponen fitur terkait. Tidak ada `services/`, `repository/`, `hooks/` generik — yang tak terpakai 2 tempat = buang.

## 2. Routing

| Route | Tipe | Akses | Fungsi |
|---|---|---|---|
| `/` | redirect | publik | → `/beranda` |
| `/login` | page | publik | Login (Better Auth) |
| `/beranda` | page | sesi | Dashboard: KPI, grafik, tunggakan, transaksi terbaru |
| `/santri` | page | sesi | Tabel santri + filter + pagination |
| `/santri/[id]` | page | sesi | Profil santri (detail + statistik) |
| `/pembayaran-spp/[id]` | page | sesi | Checklist 12 bulan + riwayat + kwitansi |
| `/pemasukan` | page | sesi | Kas masuk: ringkasan + tabel + modal |
| `/pengeluaran` | page | sesi | Kas keluar: ringkasan + tabel + bukti |
| `/laporan` | page | sesi | Rekap + ekspor |
| `/pengaturan` | page | sesi (admin/bendahara) | Profil TPQ, SPP rate, kategori |
| `/api/auth/[...all]` | route | publik | Endpoint Better Auth (login/logout/session) |
| `/api/export/[jenis]` | route | sesi | Unduh CSV (pemasukan/pengeluaran/laporan) |
| `/api/bukti/[id]` | route | sesi | Signed URL bukti (private bucket) |

- **Route group**: `(app)` berisi layout dengan guard + AppShell; `(auth)` tanpa shell.
- **Dynamic route**: `[id]` = UUID santri (bukan slug — data internal).
- **Middleware** (`src/middleware.ts`, edge): cek keberadaan cookie sesi Better Auth (`getSessionCookie()` dari `better-auth/cookies` — ringan, tanpa DB). Tidak ada cookie → redirect `/login`. Route publik (`/login`, `/api/auth/*`) di-exclude. Validasi penuh dilakukan di server (layout `(app)` + tiap server action) — middleware hanya gerbang cepat.

## 3. Authentication (Better Auth)

**Penyedia**: email + password (Better Auth `emailAndPassword`). Sesi cookie httpOnly.

**Konfigurasi** (`src/lib/auth.ts`):
```ts
betterAuth({
  appName: "TPQ Finance",
  database: prisma,                     // adapter Prisma bawaan
  emailAndPassword: { enabled: true },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 }, // 7 hari, refresh harian
  user: {
    additionalFields: {
      tenantId: { type: "string", required: true },
      role: { type: "string", required: true },   // SUPER_ADMIN | BENDAHARA | VIEWER
      status: { type: "string", required: true }, // AKTIF | NONAKTIF
    },
  },
  // hooks: afterLogin → update lastLoginAt + audit LOGIN (fire-and-forget, jangan block)
})
```

**Sinkronisasi `User` dengan DATABASE.md** (kolom wajib Better Auth):
| Kolom DATABASE.md | Menjadi | Catatan |
|---|---|---|
| `nama` | `name` | Konvensi Better Auth |
| `passwordHash` | `password` | Di-hash Better Auth (scrypt) — tetap tidak pernah plaintext |
| `avatarUrl` | `image` | Kolom standar |
| — | `emailVerified` (Boolean, default false) | Wajib Better Auth |
| `role`, `tenantId`, `status` | `additionalFields` | Tetap kolom Prisma (sama seperti schema referensi) |
| `deletedAt` | tetap | Filter soft delete di extension — Better Auth memanggil `findFirst` user saat login; extension menambahkan `deletedAt: null` → user soft-deleted otomatis gagal login |

Tabel Better Auth tambahan: `session`, `account`, `verification` (dibuat otomatis saat `prisma db push`/migrate). `session` = tabel sesi (token, userId, expires, ipAddress, userAgent) — kolom `deletedAt` tidak ada, tidak perlu.

**Login** (Server Action `actions/auth.ts`):
```ts
"use server";
export async function login(prev, formData) {
  const res = await authClient.signIn.email({ email, password }); // atau auth.api.signInEmail server-side
  if (res.error) return { error: "Email atau password salah." };
  return { ok: true };
}
```
Client `createAuthClient` dari `better-auth/react` untuk tombol login/logout. Komponen lain **tidak** menyentuh auth client — sesi dibaca server-side.

**Sesi di server** (`src/lib/session.ts`):
```ts
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.user.status !== "AKTIF") redirect("/login");
  if (!roles.includes(s.user.role as Role)) throw new Error("FORBIDDEN"); // → notFound/403
  return s;
}
```

## 4. Authorization

**Model**: 3 peran (PRD §5) — `SUPER_ADMIN`, `BENDAHARA`, `VIEWER`. Tersimpan di `User.role` (additionalFields). **Pola: check server-side di 2 lapis, UI hanya cermin.**

1. **Lapis UI (kosmetik)**: server component render tombol Tambah/Edit/Hapus hanya jika `role` punya izin (`canEdit(role)` dari `lib/session.ts`). Viewer tidak melihat tombol — tapi ini tidak pernah jadi pengaman.
2. **Lapis otorisasi (pengaman)**: setiap Server Action / route handler memanggil `requireRole(...)` **sebelum** menyentuh data. Viewer memanggil `saveTransaksi` → throw. Route `/api/export/*` → `requireRole(BENDAHARA, SUPER_ADMIN)` (PRD FR-AUTH-04: viewer tak ekspor).

**Matriks aksi** (satu helper, satu tempat):
```ts
export const IZIN = {
  kelolaSantri:    ["SUPER_ADMIN", "BENDAHARA"],
  kelolaTransaksi: ["SUPER_ADMIN", "BENDAHARA"],
  ekspor:          ["SUPER_ADMIN", "BENDAHARA"],
  kelolaPengaturan:["SUPER_ADMIN", "BENDAHARA"],
  kelolaUser:      ["SUPER_ADMIN"],
} as const;
```
Dipakai UI (hide) dan action (guard). **Satu definisi = tidak ada drift antara UI dan pengaman.**

**Data scoping**: semua query memakai `tenantId` dari sesi (lihat §6) — user TPQ A tidak bisa membaca TPQ B walau role-nya benar.

**C12 (DATABASE.md)**: minimal 1 SUPER_ADMIN per tenant; user tidak bisa menonaktifkan diri sendiri — guard di action `kelolaUser`.

## 5. State Management

**Keputusan: tidak ada library state global (tidak zustand/redux/jotai).**

- **Server = sumber kebenaran**: halaman = server components yang query Prisma langsung. Data mengalir satu arah, tanpa cache client yang bisa basi.
- **Form**: `useActionState` (React 19) + zod (`validations.ts`) — error per-field, pending state, revalidasi via `revalidatePath()` setelah aksi sukses.
- **Interaksi UI lokal** (useState di client component, tanpa store): sidebar drawer mobile, dialog buka/tutup, tab, filter UI.
- **Update optimis**: `useOptimistic` khusus di checklist SPP (FR-SPP-05) — klik bulan → langsung hijau, rollback jika action gagal. Satu-satunya tempat optimistic UI; jangan dipakai di tempat lain (uang = data sensitif, tunggu konfirmasi server).
- **Cache data**: `revalidatePath`/`revalidateTag` setelah mutasi. Data dashboard di-cache `unstable_cache`/`revalidateTag("dashboard")` per tenant — tag ber-tenant agar invalidasi tidak lintas-TPQ.

```tsx
// pola form (ringkas)
const [state, action, pending] = useActionState(simpanSantri, initialState);
<form action={action}> ... <Button disabled={pending}>Simpan</Button>
```
zod parse di server action; error dikembalikan ke state; `revalidatePath("/santri")` sukses.

## 6. Server Actions

**Semua mutasi = Server Action.** Tidak ada API route untuk CRUD (satu jalur, otorisasi & validasi otomatis server-side, tanpa endpoint yang bisa dipanggil langsung).

Pola baku setiap action (`src/actions/transaksi.ts` contoh):
```ts
"use server";

export async function tambahPemasukan(prev: FormState, formData: FormData): Promise<FormState> {
  // 1. Otorisasi
  const s = await requireRole("SUPER_ADMIN", "BENDAHARA");
  // 2. Validasi (zod) — trust boundary, wajib
  const data = schemaPemasukan.parse(Object.fromEntries(formData));
  // 3. Mutasi atomik + audit
  await prisma.$transaction(async (tx) => {
    const trx = await tx.transaksi.create({ data: { ...data, tenantId: s.user.tenantId, createdById: s.user.id } });
    await audit(tx, { tenantId, userId: s.user.id, aksi: "CREATE", entitas: "Transaksi", entitasId: trx.id, detail: { data } });
  });
  // 4. Sinkronkan UI
  revalidatePath("/pemasukan"); revalidateTag("dashboard");
  return { ok: true, pesan: "Pemasukan tersimpan." };
}
```

**Aturan**:
- Action menerima `FormData` (bukan objek) → aman dari serialisasi client; zod parse di server.
- Semua dalam `$transaction` (NFR-03): mutasi + audit log gagal bersama.
- Error: kembalikan ke `FormState` (field error / pesan toast), jangan throw ke client kecuali FORBIDDEN.
- Upload file lewat action juga (`FormData` berisi File) — lihat §8.
- Nama action = intent bisnis (`tambahPemasukan`, `catatPembayaranSpp`, `nonaktifkanSantri`), bukan CRUD generik (`save`).

**Pembayaran SPP (BR-03, atomik)**: satu `$transaction`: create `Pembayaran` + create `Transaksi` (jenis PEMASUKAN, kategori "SPP Santri", sumber = nama santri, nominal = snapshot) + update checklist. Gagal satu → rollback semua. Unique `(tenantId, santriId, bulan)` menolak bayar ganda di level DB (EC-03).

## 7. API (Route Handlers)

Hanya 3 route — semua yang bisa jadi server action, jadi server action:

| Route | Kebutuhan |
|---|---|
| `/api/auth/[...all]` | Endpoint Better Auth (wajib) |
| `/api/export/[jenis]` | **Download file** — action tak bisa memicu browser download; route GET + `requireRole` + set `Content-Disposition: attachment` + stream CSV |
| `/api/bukti/[id]` | **Signed URL** bukti dari bucket privat (Supabase `createSignedUrl`, 1 jam) — client image tak boleh pegang service key |

Tidak ada: REST CRUD, WebSocket, webhook (V2 payment gateway baru butuh webhook — tambah saat itu).

CSV dibuat di `lib/export.ts` (stdlib: kolom + `\r\n` + escape `"`), bukan library.

## 8. Upload File (Supabase Storage)

**Kasus**: bukti pengeluaran (nota/struk), PNG/JPG ≤ 10MB (FR-KAS-06).

**Alur (server relay — lazy, cukup untuk 10MB)**:
1. User pilih file di `FileUploadZone` (client preview via `URL.createObjectURL`, tanpa upload dulu).
2. Submit form → Server Action `tambahPengeluaran` menerima `FormData` berisi File.
3. Validasi: tipe (PNG/JPG) + ukuran (≤10MB) — di server (trust boundary; client check hanya UX).
4. Upload ke Supabase Storage via **admin client** (`src/lib/supabase.ts`, service role key — **server-only**, jangan pernah di client bundle):
   `storage.from("bukti").upload(tenantId + "/" + uuid + ext, file, { contentType, upsert: false })`
   Path ber-tenant: `bukti/{tenantId}/{uuid}.jpg` (isolasi V3, nama unik).
5. Simpan `buktiUrl = path` di Transaksi (dalam `$transaction` yang sama).
6. Tampil: `<img>` memakai `/api/bukti/[id]` → signed URL (1 jam, auto-refresh saat modal preview dibuka).
7. Hapus transaksi (soft) → file **tetap** di bucket (jejak audit, BR-05); pembersihan file orphan = job manual V2.

Bucket: `bukti` — **private** (tanpa public read; semua akses via signed URL). Anon key tak dipakai client untuk storage (server relay).

`ponytail:` server relay (file lewat action) — untuk 10MB/menit sekali, simpel dan auth gratis. Ganti ke signed-upload (client → bucket langsung, `createSignedUploadUrl`) hanya jika file besar/sering/bandwidth server jadi masalah.

## 9. PDF

**Keputusan: tanpa library PDF. Browser print.**

- Kwitansi & laporan = halaman/komponen cetak: layout `print:hidden` pada shell (sidebar, navbar, tombol), `print:block` pada area dokumen; `@media print` untuk ukuran A4, margin, `break-inside: avoid` per baris.
- "Cetak PDF" → `window.print()` (button client) atau link ke route `?print=1` yang langsung memanggil print. Footer/halaman dinamis via CSS `@page`.
- Format uang/tanggal sama dengan layar (tabular-nums) — dokumen konsisten dengan desain.

`ponytail:` browser print. Tambah `@react-pdf/renderer` (server-side generate) hanya jika butuh: unduh PDF tanpa dialog print, email attachment (V2 notifikasi wali), atau template kompleks berhalaman banyak.

## 10. Logging

Dua lapis, sesuai kebutuhan nyata:

1. **Audit log bisnis → database** (`AuditLog`, DATABASE.md §9): siapa mengubah apa kapan — CREATE/UPDATE/DELETE/LOGIN/EXPORT. Append-only, ditulis dalam `$transaction` mutasi. Inilah log yang dibaca orang (investigasi, laporan pengurus).
2. **Log teknis → console (JSON)** (`src/lib/logger.ts`):
   ```ts
   export const log = {
     info: (msg, ctx?) => console.log(JSON.stringify({ t: "INFO", msg, ...ctx })),
     warn: ...,
     error: (msg, err?, ctx?) => console.error(JSON.stringify({ t: "ERROR", msg, err: err?.message, ...ctx })),
   };
   ```
   Dipakai: start/stop server, kegagalan upload, error tak terduga di action (catch-all → `log.error` + FormState error). Runtime Vercel/Supabase menangkap stdout — tidak butuh pino/otel untuk V1.

`ponytail:` console JSON. Tambah pino + transport (file/SIEM) saat: log teknis > beberapa ratus baris/hari atau butuh query/retensi panjang. Audit bisnis tetap di DB — tidak ikut migrasi logger.

**Tidak dicatat**: pembacaan (view) data — mahal, tak berguna untuk TPQ (keputusan DATABASE.md §9, tetap).

---

## Env (`.env.local`)

```
DATABASE_URL=postgresql://...@aws-0-...pooler.supabase.com:6543/postgres   # pooler (transaction mode)
DIRECT_URL=postgresql://...@db.aws-0-...supabase.com:5432/postgres          # koneksi langsung untuk migrasi
BETTER_AUTH_SECRET=...          # openssl rand -base64 32
BETTER_AUTH_URL=https://tpq-finance.vercel.app
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...   # server-only! jangan pernah di komponen client
SUPABASE_BUCKET_BUKTI=bukti
```

## Catatan migrasi dari DATABASE.md

1. `User`: `nama`→`name`, `passwordHash`→`password`, `avatarUrl`→`image`, tambah `emailVerified Boolean @default(false)`, `role/tenantId/status` jadi `additionalFields` Better Auth (tetap kolom biasa di Prisma).
2. Tabel `session`, `account`, `verification` ditambahkan Better Auth (adapter Prisma buat otomatis).
3. CHECK constraints (`jumlah > 0`, `nominal > 0`, `tanggal <= now()`) tetap manual SQL di migration pertama (Prisma tanpa syntax CHECK).
4. Prisma Client Extension tetap: soft delete + auto-`tenantId` + `delete`→soft (DATABASE.md §8, §10) — Better Auth login ikut ter-filter `deletedAt: null`.
5. Seed: 1 Tenant + 1 Super Admin + 8 kategori (BR-13) + SppRate 3 jenjang.

## Ringkasan keputusan lazy

| Pertanyaan | Jawaban | Ganti saat |
|---|---|---|
| State global? | Tidak ada (server-first + useActionState + useOptimistic 1 tempat) | Form kompleks berulang → react-hook-form |
| REST API? | Tidak — Server Actions + 3 route handler khusus | Butuh konsumen API publik (V3) |
| Upload? | Server relay via action | File besar/sering → signed upload |
| PDF? | Browser print | Unduh tanpa dialog / attachment email (V2) |
| Logging? | Console JSON + audit DB | Volume teknis tinggi → pino |
| Zustand/redux? | Skip | Terbukti butuh state global lintas-halaman |
