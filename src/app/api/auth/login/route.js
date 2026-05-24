import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth";
import { createToken } from "@/lib/jwt";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req) {

      // RATE LIMIT — 5 attempts per 60 seconds
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
                        headers: {
                              "Retry-After": String(limited.retryAfter),
                        },
                  }
            );
      }

      try {
            const { email, password } = await req.json();

            // VALIDATION
            if (!email?.trim() || !password?.trim()) {
                  return errorResponse("Email and password are required", 400);
            }

            // FIND USER
            const user = await prisma.user.findUnique({
                  where: { email: email.trim().toLowerCase() },
            });

            if (!user) {
                  return errorResponse("Invalid email or password", 401);
            }

            // PASSWORD
            const isValid = await comparePassword(password, user.password);

            if (!isValid) {
                  return errorResponse("Invalid email or password", 401);
            }

            // TOKEN
            const token = createToken({
                  id: user.id,
                  role: user.role,
            });

            // RESPONSE
            const response = successResponse({
                  message: "Login successful",
                  role: user.role,
            });

            // COOKIE
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