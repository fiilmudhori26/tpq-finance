import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 hari
    updateAge: 60 * 60 * 24, // refresh harian
  },
  user: {
    additionalFields: {
      tenantId: {
        type: "string",
        required: true,
        input: false,
        returned: true,
        fieldName: "tenantId",
      },
      role: {
        type: "string",
        required: true,
        input: false,
        returned: true,
        fieldName: "role",
      },
      status: {
        type: "string",
        required: true,
        input: false,
        returned: true,
        fieldName: "status",
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // LOGIN sukses — update lastLoginAt + audit (fire-and-forget)
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { tenantId: true },
          });
          if (!user) return;
          await db.user.update({
            where: { id: session.userId },
            data: { lastLoginAt: new Date() },
          });
          await db.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: session.userId,
              aksi: "LOGIN",
              entitas: "User",
              entitasId: session.userId,
              detail: {},
            },
          });
        },
      },
      delete: {
        after: async (session) => {
          // LOGOUT
          const user = await db.user.findUnique({
            where: { id: session.userId },
            select: { tenantId: true },
          });
          if (!user) return;
          await db.auditLog.create({
            data: {
              tenantId: user.tenantId,
              userId: session.userId,
              aksi: "LOGOUT",
              entitas: "User",
              entitasId: session.userId,
              detail: {},
            },
          });
        },
      },
    },
  },
  plugins: [nextCookies()],
});
