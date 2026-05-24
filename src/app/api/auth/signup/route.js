import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";
import { NextResponse } from "next/server";

export async function POST(req) {

      // RATE LIMIT — 3 attempts per 60 seconds
      const limited = rateLimit(req, {
            key: "signup",
            limit: 3,
            windowMs: 60 * 1000,
      });

      if (limited) {
            return NextResponse.json(
                  {
                        success: false,
                        error: `Too many signup attempts. Try again in ${limited.retryAfter} seconds.`,
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
            const body = await req.json();
            const name = body.name?.trim();
            const email = body.email?.trim().toLowerCase();
            const password = body.password?.trim();

            // VALIDATION
            if (!name || !email || !password) {
                  return errorResponse("All fields are required", 400);
            }

            if (name.length < 2) {
                  return errorResponse("Name is too short", 400);
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                  return errorResponse("Invalid email address", 400);
            }

            if (password.length < 6) {
                  return errorResponse("Password must be at least 6 characters", 400);
            }

            // EXISTING USER
            const existingUser = await prisma.user.findUnique({
                  where: { email },
            });

            if (existingUser) {
                  return errorResponse("Email already registered", 400);
            }

            // HASH PASSWORD
            const hashedPassword = await hashPassword(password);

            // CREATE USER
            const user = await prisma.user.create({
                  data: {
                        name,
                        email,
                        password: hashedPassword,
                  },
            });

            return successResponse(
                  { message: "User created successfully", userId: user.id },
                  201
            );

      } catch (err) {
            console.error("SIGNUP ERROR:", err);
            return errorResponse("Internal server error", 500);
      }
}