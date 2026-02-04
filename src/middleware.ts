import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get the token using the secret
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  // Public admin routes
  const publicRoutes = ["/admin/login"];
  if (publicRoutes.includes(pathname)) {
    // If already logged in, redirect to dashboard
    if (token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Protected admin routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access for specific routes
    const adminOnlyRoutes = ["/admin/usuarios"];
    if (adminOnlyRoutes.some((route) => pathname.startsWith(route))) {
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
