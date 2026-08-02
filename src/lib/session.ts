import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type Role = "SUPER_ADMIN" | "BENDAHARA" | "VIEWER";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "AKTIF" | "NONAKTIF";
  tenantId: string;
};

export async function getSession(): Promise<{ user: SessionUser } | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;

  // Better-auth session tidak bawa additionalFields (role/tenantId/status).
  // Fetch manual dari DB via userId.
  const u = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, status: true, tenantId: true },
  });
  if (!u || !u.tenantId) return null;

  return { user: { ...session.user, role: u.role as Role, status: u.status, tenantId: u.tenantId } };
}

/**
 * Wajib login + status AKTIF + role diizinkan. Redirect /login bila tak login,
 * throw FORBIDDEN bila peran tak punya izin (ditangkap caller → 403).
 */
export async function requireRole(...roles: Role[]) {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.user.status !== "AKTIF") redirect("/login");
  if (!roles.includes(s.user.role)) throw new Error("FORBIDDEN");
  return s;
}

/** Matriks izin — satu definisi untuk UI (hide) & server action (guard). */
export const IZIN = {
  kelolaSantri: ["SUPER_ADMIN", "BENDAHARA"] as Role[],
  kelolaTransaksi: ["SUPER_ADMIN", "BENDAHARA"] as Role[],
  ekspor: ["SUPER_ADMIN", "BENDAHARA"] as Role[],
  kelolaPengaturan: ["SUPER_ADMIN", "BENDAHARA"] as Role[],
  kelolaUser: ["SUPER_ADMIN"] as Role[],
};
