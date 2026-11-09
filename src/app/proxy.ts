import { NextRequest, NextResponse } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdmin       = pathname.startsWith("/admin");
  const isPortal      = pathname.startsWith("/portal");
  const isAdminLogin  = pathname === "/login";
  const isPortalLogin = pathname === "/portal/login";

  if (!isAdmin && !isPortal && !isAdminLogin) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token).catch(() => null) : null;
  const role = user?.role;

  if (isAdmin) {
    if (!user) return NextResponse.redirect(new URL("/login", request.url));
    if (role === "OWNER") return NextResponse.redirect(new URL("/portal", request.url));
    return NextResponse.next(); // ADMIN
  }

  if (isPortal) {
    if (isPortalLogin) {
      if (!user) return NextResponse.next(); // muestra el login
      return role === "ADMIN"
        ? NextResponse.redirect(new URL("/admin", request.url))
        : NextResponse.redirect(new URL("/portal", request.url));
    }
    // rutas protegidas del portal
    if (!user) return NextResponse.redirect(new URL("/portal/login", request.url));
    if (role === "ADMIN") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.next(); // OWNER
  }

  // /login (admin)
  if (user) return role === "OWNER"
    ? NextResponse.redirect(new URL("/portal", request.url))
    : NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*", "/login"],
};
