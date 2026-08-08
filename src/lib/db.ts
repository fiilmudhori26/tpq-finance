import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

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
    max: 10, // ponytail: 5 dulu → request antri (latensi Neon ~80ms/query, 1 halaman 3-4 slot). Naikkan kalau traffic tumbuh.
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: typeof db };

const base = new PrismaClient({ adapter: new PrismaPg(poolFromUrl()) });

// Model bisnis ber-soft-delete; model Better Auth (Account/Session/Verification)
// tanpa kolom deletedAt — tidak tersentuh extension.
const SOFT_DELETE_MODELS = [
  "User",
  "Santri",
  "Kategori",
  "Transaksi",
  "Pembayaran",
  "SppRate",
] as const;

// Prisma Client Extension — soft delete dalam satu tempat, bukan di tiap query.
export const db = base.$extends({
  query: {
    $allModels: {
      async findMany({ model, args, query }) {
        if (isSoftDeleteModel(model)) args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async findFirst({ model, args, query }) {
        if (isSoftDeleteModel(model)) args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async count({ model, args, query }) {
        if (isSoftDeleteModel(model)) args.where = { ...args.where, deletedAt: null };
        return query(args);
      },
      async delete({ model, args, query }) {
        // Delete fisik hanya untuk model tanpa deletedAt (Better Auth) — model
        // bisnis lewat soft-delete update.
        if (isSoftDeleteModel(model)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (base as any)[model].update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        return query(args);
      },
      async deleteMany({ model, args, query }) {
        if (isSoftDeleteModel(model)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (base as any)[model].updateMany({ where: args.where, data: { deletedAt: new Date() } });
        }
        return query(args);
      },
    },
  },
});

function isSoftDeleteModel(model: string): model is (typeof SOFT_DELETE_MODELS)[number] {
  return (SOFT_DELETE_MODELS as readonly string[]).includes(model);
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
