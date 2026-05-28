import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req) {

      const { pathname } = req.nextUrl;
      const token = req.cookies.get("token")?.value;
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);

      /* ===== LOGIN / SIGNUP ===== */
      if (pathname === "/login" || pathname === "/signup") {

            if (!token) return NextResponse.next();

            try {
                  const { payload } = await jwtVerify(token, secret);

                  if (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")
                        return NextResponse.redirect(new URL("/admin", req.url));

                  if (payload.role === "MENTOR")
                        return NextResponse.redirect(new URL("/mentor", req.url));

                  return NextResponse.redirect(new URL("/dashboard", req.url));

            } catch {
                  const res = NextResponse.next();
                  res.cookies.delete("token");
                  return res;
            }
      }

      /* ===== NO TOKEN ===== */
      if (!token) {
            if (pathname.startsWith("/api")) {
                  return NextResponse.json(
                        { success: false, error: "Unauthorized" },
                        { status: 401 }
                  );
            }
            return NextResponse.redirect(new URL("/login", req.url));
      }

      /* ===== VERIFY TOKEN ===== */
      let payload;

      try {
            const verified = await jwtVerify(token, secret);
            payload = verified.payload;
      } catch {
            const res = pathname.startsWith("/api")
                  ? NextResponse.json(
                        { success: false, error: "Invalid token" },
                        { status: 401 }
                  )
                  : NextResponse.redirect(new URL("/login", req.url));

            res.cookies.delete("token");
            return res;
      }

      const role = payload.role;

      /* ===== ADMIN ROUTES ===== */
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
            if (!["ADMIN", "SUPER_ADMIN"].includes(role)) {
                  if (pathname.startsWith("/api")) {
                        return NextResponse.json(
                              { success: false, error: "Forbidden" },
                              { status: 403 }
                        );
                  }
                  return NextResponse.redirect(new URL("/dashboard", req.url));
            }
      }

      /* ===== MENTOR PAGE ROUTES ===== */
      if (pathname.startsWith("/mentor")) {
            if (role !== "MENTOR") {
                  return NextResponse.redirect(new URL("/dashboard", req.url));
            }
      }

      /* ===== MENTOR API — management only, not public listing ===== */
      if (
            pathname.startsWith("/api/mentor/interviews") ||
            pathname.startsWith("/api/mentor/availability")
      ) {
            if (role !== "MENTOR") {
                  return NextResponse.json(
                        { success: false, error: "Forbidden" },
                        { status: 403 }
                  );
            }
      }

      /* ===== DASHBOARD ROUTES ===== */
      if (pathname.startsWith("/dashboard")) {
            if (role === "ADMIN" || role === "SUPER_ADMIN")
                  return NextResponse.redirect(new URL("/admin", req.url));

            if (role === "MENTOR")
                  return NextResponse.redirect(new URL("/mentor", req.url));
      }

      return NextResponse.next();
}

export const config = {
      matcher: [
            "/login",
            "/signup",
            "/dashboard/:path*",
            "/mentor/:path*",
            "/admin/:path*",
            "/api/interviews/:path*",
            "/api/mentor/interviews/:path*",
            "/api/mentor/availability/:path*",
            "/api/admin/:path*",
            "/api/me",
      ],
};