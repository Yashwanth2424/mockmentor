import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { createToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";
import { loginSchema } from "@/lib/validators";

export async function POST(req) {

      const limited = rateLimit(req, {
            key: "login",
            limit: 5,
            windowMs: 60 * 1000,
      });

      if (limited) {
            return NextResponse.json(
                  {
                        success: false,
                        error: `Too many login attempts. Try again in ${limited.retryAfter} seconds.`,
                  },
                  {
                        status: 429,
                        headers: { "Retry-After": String(limited.retryAfter) },
                  }
            );
      }

      try {
            const body = await req.json();

            const parsed = loginSchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.issues[0]?.message || "Invalid input";
                  return errorResponse(message, 400);
            }

            const { email, password } = parsed.data;

            const user = await prisma.user.findUnique({
                  where: { email },
            });

            if (!user) {
                  return errorResponse("Invalid email or password", 401);
            }

            const isValid = await comparePassword(password, user.password);

            if (!isValid) {
                  return errorResponse("Invalid email or password", 401);
            }

            const token = createToken({
                  id: user.id,
                  role: user.role,
            });

            const response = successResponse({
                  message: "Login successful",
                  role: user.role,
            });

            response.cookies.set({
                  name: "token",
                  value: token,
                  httpOnly: true,
                  secure: process.env.NODE_ENV === "production",
                  sameSite: "lax",
                  path: "/",
                  maxAge: 60 * 60 * 24 * 7,
            });

            return response;

      } catch (err) {
            console.error("LOGIN ERROR:", err);
            return errorResponse("Server error", 500);
      }
}