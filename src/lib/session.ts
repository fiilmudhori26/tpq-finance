import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

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
  const u = session.user as unknown as SessionUser;
  if (!u.tenantId) return null;
  return { user: u };
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
