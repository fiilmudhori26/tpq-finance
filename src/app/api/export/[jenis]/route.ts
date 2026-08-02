import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";

type Params = { params: Promise<{ jenis: string }> };

// Fase 9 (T28) isi CSV asli. Stub: proteksi role (viewer 403, E15).
export async function GET(_req: Request, { params }: Params) {
  const { jenis } = await params;
  try {
    await requireRole("SUPER_ADMIN", "BENDAHARA");
  } catch {
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  }
  return NextResponse.json(
    { pesan: `Ekspor "${jenis}" belum diimplementasikan (Fase 9).` },
    { status: 501 }
  );
}
