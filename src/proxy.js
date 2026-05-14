import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function proxy(req) {

      const { pathname } = req.nextUrl;

      const token = req.cookies.get("token")?.value;

      const secret = new TextEncoder().encode(
            process.env.JWT_SECRET
      );

      //  LOGIN PAGE 

      if (pathname === "/login") {

            if (!token) {
                  return NextResponse.next();
            }

            try {

                  const { payload } = await jwtVerify(
                        token,
                        secret
                  );

                  // ADMIN
                  if (
                        payload.role === "ADMIN" ||
                        payload.role === "SUPER_ADMIN"
                  ) {
                        return NextResponse.redirect(
                              new URL("/admin", req.url)
                        );
                  }

                  // MENTOR
                  if (payload.role === "MENTOR") {
                        return NextResponse.redirect(
                              new URL("/mentor", req.url)
                        );
                  }

                  // STUDENT
                  return NextResponse.redirect(
                        new URL("/dashboard", req.url)
                  );

            } catch {

                  const response = NextResponse.next();

                  response.cookies.delete("token");

                  return response;
            }
      }

      //  PROTECTED ROUTES 

      const protectedRoutes = [
            "/dashboard",
            "/admin",
            "/mentor",
            "/api/admin",
            "/api/mentor",
      ];

      const isProtected = protectedRoutes.some((route) =>
            pathname.startsWith(route)
      );


      if (isProtected && !token) {

            if (pathname.startsWith("/api")) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            return NextResponse.redirect(
                  new URL("/login", req.url)
            );
      }

      try {

            const { payload } = await jwtVerify(
                  token,
                  secret
            );

            //  ADMIN 

            if (pathname.startsWith("/admin")) {

                  if (
                        !["ADMIN", "SUPER_ADMIN"].includes(payload.role)
                  ) {
                        return NextResponse.redirect(
                              new URL("/dashboard", req.url)
                        );
                  }
            }

            //  MENTOR 

            if (pathname.startsWith("/mentor")) {

                  if (payload.role !== "MENTOR") {

                        return NextResponse.redirect(
                              new URL("/dashboard", req.url)
                        );
                  }
            }

            // Protect mentor management APIs only
            if (
                  pathname.startsWith("/api/mentor/interviews") ||
                  pathname.startsWith("/api/mentor/availability")
            ) {

                  if (payload.role !== "MENTOR") {

                        return NextResponse.json(
                              { error: "Forbidden" },
                              { status: 403 }
                        );
                  }
            }

            //  DASHBOARD 

            if (pathname.startsWith("/dashboard")) {

                  if (
                        payload.role === "ADMIN" ||
                        payload.role === "SUPER_ADMIN"
                  ) {
                        return NextResponse.redirect(
                              new URL("/admin", req.url)
                        );
                  }

                  if (payload.role === "MENTOR") {
                        return NextResponse.redirect(
                              new URL("/mentor", req.url)
                        );
                  }
            }

            return NextResponse.next();

      } catch {

            const response = pathname.startsWith("/api")
                  ? NextResponse.json(
                        { error: "Invalid token" },
                        { status: 401 }
                  )
                  : NextResponse.redirect(
                        new URL("/login", req.url)
                  );

            response.cookies.delete("token");

            return response;
      }
}

export const config = {
      matcher: [
            "/login",
            "/dashboard/:path*",
            "/mentor/:path*",
            "/admin/:path*",

            "/api/interviews/:path*",
            "/api/mentor/:path*",
            "/api/admin/:path*",
            "/api/me",
      ],
};