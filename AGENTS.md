# AGENTS.md — TPQ Finance

Aturan kerja untuk AI agent (Claude Code, dll.) selama implementasi proyek TPQ Finance.

## Proyek

- **TPQ Finance**: sistem manajemen keuangan TPQ (santri, SPP, kas, laporan).
- **Stack**: Next.js 15 (App Router) · TypeScript strict · Prisma + PostgreSQL (Supabase) · Better Auth · Tailwind CSS · shadcn/ui · Lucide Icons · Recharts.
- **Semua teks UI Bahasa Indonesia (EYD)** — tidak ada string Inggris di antarmuka.
- **Sumber kebenaran desain & arsitektur** (baca sebelum menulis kode):
  - `docs/PRD.md` — kebutuhan & business rules (BR-01..13)
  - `docs/DATABASE.md` — schema, enum, constraint, soft delete, audit
  - `docs/ARCHITECTURE.md` — pola server actions, auth, upload, ekspor
  - `docs/DESIGN_SYSTEM.md` — token warna, tipografi, komponen
  - `docs/IMPLEMENTATION_PLAN.md` — task T01..T34, kerjakan berurutan

## Prinsip Kode

1. **Lazy (ponytail)**: kode minimum yang bekerja. Jangan buat yang tidak diminta (YAGNI). Stdlib & dependency terpasang dulu, baru yang lain. Reuse sebelum menulis.
2. **DRY**: helper yang dipakai ≥2 tempat → satu fungsi di `src/lib/` (format, validasi, auth, audit). Jangan copy-paste query/format.
3. **KISS**: komponen satu tanggung jawab, nama = intent bisnis (`tambahPemasukan`, bukan `save`). Tanpa abstraksi yang belum dipakai (tanpa interface 1 implementasi, tanpa factory, tanpa config untuk nilai tetap).
4. **SOLID**: fungsi pendek; dependensi lewat param; `src/lib/session.ts` satu-satunya sumber izin (matriks `IZIN`); UI hanya cermin, otorisasi selalu di server action.
5. **TypeScript strict**: `strict: true`; tanpa `any` (kecuali terpaksa + komentar); tipe domain di `src/types/`; zod schema = satu-satunya definisi bentuk form.

## Konvensi

- **Server-first**: halaman = server components; **semua mutasi = Server Action** (`"use server"` di `src/actions/`). Bukan REST CRUD.
- **Setiap action**: requireRole → zod parse → `$transaction` (mutasi + audit log) → revalidatePath/revalidateTag. Pola persis di `src/actions/transaksi.ts` (T14) — tiru, jangan buat pola baru.
- **Semua query ber-tenant**: `tenantId` dari sesi, diinjeksi Prisma extension — jangan pernah hardcode/lewat manual.
- **Soft delete**: lewat extension, bukan `prisma.delete()` manual. Soft-deleted baris tidak muncul di query manapun.
- **Audit**: setiap CREATE/UPDATE/DELETE/EXPORT dicatat `audit(tx, ...)` dalam transaksi yang sama.
- **Komponen**: shadcn/ui di `src/components/ui/` (jangan edit manual tanpa alasan); komponen fitur di `src/components/features/`, reusable, props eksplisit. Ikon: Lucide saja.
- **Styling**: Tailwind utility + token desain (warna/radius/shadow dari DESIGN_SYSTEM) — **jangan hardcode hex sembarangan**; token tak ada → tambah ke config, bukan inline.
- **Responsive**: mobile-first; sidebar drawer <768px; tabel `overflow-x-auto`; modal mobile full-width; cek 360/768/1280.
- **Aksesibilitas**: form pakai `<label htmlFor>`; error inline + `aria-describedby`; dialog Radix (focus trap/Escape gratis — jangan disable); kontras token jangan diubah.
- **Format**: `formatRupiah()` (Intl id-ID, tabular-nums) untuk semua nominal — jangan string template manual.
- **Nama file**: `kebab-case`; action per domain (`santri.ts`, `transaksi.ts`, `pembayaran.ts`).

## Larangan

- ❌ Menambah dependency tanpa alasan (stdlib/CSS/DB constraint dulu).
- ❌ Mutasi data dari komponen client langsung (harus lewat Server Action).
- ❌ Menaruh `SUPABASE_SERVICE_ROLE_KEY` / secret di komponen client / env publik.
- ❌ Menghapus data fisik dari UI (selalu soft delete).
- ❌ Mengubah desain acuan tanpa alasan teknis jelas (tulis alasan di commit).
- ❌ String UI Inggris, placeholder Inggris, komentar berlebihan.
- ❌ `console.log` sisa debug (pakai `src/lib/logger.ts`).
- ❌ Task di luar urutan `IMPLEMENTATION_PLAN.md` tanpa instruksi.

## Gate (wajib sebelum commit per task)

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Tiga-duanya hijau → lanjut task berikutnya; merah → perbaiki, jangan lanjut. Setiap task selesai: checklist di `docs/IMPLEMENTATION_PLAN.md` dicentang (⬜ → ✅) dan commit kecil dengan pesan deskriptif (`feat(santri): CRUD + filter`).

## Verifikasi visual

Sebelum task dianggap selesai, bandingkan halaman dengan acuan:
`design/stitch/<halaman>/screen.png` (beranda, santri, pembayaran-spp, pemasukan, pengeluaran). Deviasi visual tanpa alasan teknis = bug.

## Notasi ponytail

Simplifikasi sadar dengan batas diketahui → komentar `ponytail: <batas>, ganti saat <pemicu>`. Contoh: `// ponytail: server relay upload, signed-upload saat file besar/sering`.
