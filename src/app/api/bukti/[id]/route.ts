import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";

type Params = { params: Promise<{ id: string }> };

// Fase 8 (T26) isi signed URL Supabase. Stub: proteksi role + 501.
export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  try {
    await requireRole("SUPER_ADMIN", "BENDAHARA", "VIEWER");
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return NextResponse.json(
    { pesan: `Bukti "${id}" belum diimplementasikan (Fase 8).` },
    { status: 501 }
  );
}
