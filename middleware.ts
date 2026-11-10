import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Ambil token dari request
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  // 2. Daftar route yang butuh proteksi
  const protectedRoutes = ["/", "/siswa", "/presensi", "/mapel", "/jadwal", "/pengaturan"];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // 3. Daftar route yang hanya boleh diakses jika BELUM login
  const authRoutes = ["/login"];
  const isAuthRoute = authRoutes.some(route => pathname === route);

  // 4. Jika user BELUM login dan mencoba akses route yang dilindungi
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Jika user SUDAH login dan mencoba akses /login
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Konfigurasi route yang akan dijalankan middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled by NextAuth)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};