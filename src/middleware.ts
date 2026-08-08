import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  if (!sessionCookie) {
    if (pathname.startsWith("/login")) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Cookie ada tapi tak diverifikasi di sini (edge runtime tak boleh akses DB).
  // /login selalu dibiarkan render — halaman itu sendiri mengecek sesi (client-side)
  // dan melempar ke /beranda bila masih valid. Ini mencegah redirect loop saat
  // sesi DB hilang (cookie basi) tapi cookie masih ada.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:jpg|jpeg|png|svg|webp|ico|gif)$).*)"],
};
