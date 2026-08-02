import type { Prisma } from "@prisma/client";

export type AuditParams = {
  tenantId: string;
  userId?: string | null;
  aksi: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "EXPORT";
  entitas: string;
  entitasId: string;
  detail?: Prisma.InputJsonValue;
};

/**
 * Tulis baris AuditLog — dipanggil DI DALAM $transaction mutasi yang sama
 * (kalau mutasi gagal, log ikut rollback → konsisten).
 */
export function audit(
  tx: Prisma.TransactionClient,
  { tenantId, userId, aksi, entitas, entitasId, detail = {} }: AuditParams
) {
  return tx.auditLog.create({
    data: { tenantId, userId, aksi, entitas, entitasId, detail },
  });
}
