import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
      const { pathname } = req.nextUrl;
      const token = req.cookies.get("token")?.value;

      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      // =========================
      // 🔥 HANDLE LOGIN PAGE
      // =========================
      if (pathname === "/login") {
            if (!token) return NextResponse.next();

            try {
                  const { payload } = await jwtVerify(token, secret);

                  if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN") {
                        return NextResponse.redirect(new URL("/admin", req.url));
                  }

                  return NextResponse.redirect(new URL("/dashboard", req.url));

            } catch {
                  return NextResponse.next();
            }
      }

      // =========================
      // 🔐 PROTECTED ROUTES
      // =========================

      // ❌ Not logged in
      if (!token) {
            if (pathname.startsWith("/api")) {
                  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", req.url));
      }

      try {
            const { payload } = await jwtVerify(token, secret);

            // =========================
            // 🛡️ ADMIN ROUTES
            // =========================
            if (pathname.startsWith("/admin")) {
                  if (!["ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
                        return NextResponse.redirect(new URL("/dashboard", req.url));
                  }
            }

            // =========================
            // 🧑‍💻 DASHBOARD ROUTES
            // =========================
            if (pathname.startsWith("/dashboard")) {
                  // ❌ Admin should not access dashboard
                  if (["ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
                        return NextResponse.redirect(new URL("/admin", req.url));
                  }
            }

            // ✅ Allow everything else
            return NextResponse.next();

      } catch (err) {
            if (pathname.startsWith("/api")) {
                  return NextResponse.json({ error: "Invalid token" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/login", req.url));
      }
}

export const config = {
      matcher: [
            "/login",
            "/admin/:path*",
            "/dashboard/:path*",
            "/api/admin/:path*",
      ],
};