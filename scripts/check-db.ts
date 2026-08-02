import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import assert from "node:assert";

const { Pool } = pg;

function poolFromUrl() {
  const u = new URL(process.env.DATABASE_URL!);
  return new Pool({
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
    ssl: { rejectUnauthorized: false },
  });
}

const prisma = new PrismaClient({ adapter: new PrismaPg(poolFromUrl()) });

// Ekstensi soft-delete identik dengan src/lib/db.ts (disalin agar script
// standalone tanpa dependensi alias path @/).
const SOFT_DELETE_MODELS = [
  "User",
  "Santri",
  "Kategori",
  "Transaksi",
  "Pembayaran",
  "SppRate",
] as const;

const db = prisma.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if ((SOFT_DELETE_MODELS as readonly string[]).includes(model))
          args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if ((SOFT_DELETE_MODELS as readonly string[]).includes(model))
          args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async count({ model, args, query }) {
        if ((SOFT_DELETE_MODELS as readonly string[]).includes(model))
          args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async delete({ model, args }) {
        if ((SOFT_DELETE_MODELS as readonly string[]).includes(model)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (prisma as any)[model].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
      },
    },
  },
});

async function main() {
  const tenant = await db.tenant.findFirst({ where: { slug: "tpq-al-ikhlas" } });
  assert(tenant, "tenant tpq-al-ikhlas tidak ada (jalankan seed dulu)");

  const uid = `check-${Date.now()}`;
  const santri = await db.santri.create({
    data: {
      tenantId: tenant.id,
      noInduk: uid.slice(0, 10),
      nama: `Uji ${uid}`,
      jenjang: "TPA",
      kelas: "Ba",
    },
  });

  // 1. findFirst default → visible (soft filter deletedAt: null)
  const visible = await db.santri.findFirst({ where: { id: santri.id } });
  assert(visible, "santri uji harus terlihat sebelum soft-delete");

  // 2. soft-delete via delete()
  await db.santri.delete({ where: { id: santri.id } });

  // 3. findFirst → hidden setelah soft-delete
  const hidden = await db.santri.findFirst({ where: { id: santri.id } });
  assert.equal(hidden, null, "santri uji harus tak terlihat setelah soft-delete");

  // 4. count ikut filter
  const count = await db.santri.count({ where: { id: santri.id } });
  assert.equal(count, 0, "count harus 0 setelah soft-delete");

  // 5. masih ada di DB (soft delete, bukan fisik) — query model baku
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma as any).santri.findFirst({ where: { id: santri.id } });
  assert(raw, "row harus tetap ada di DB (soft delete, bukan fisik)");
  assert(raw.deletedAt, "deletedAt harus terisi");

  // Bersihkan data uji (hapus fisik via client baku)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).santri.delete({ where: { id: santri.id } });

  console.log("CHECK OK: soft-delete bekerja (visible→hidden, row tetap di DB)");
}

main()
  .catch((e) => {
    console.error("CHECK FAILED:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
