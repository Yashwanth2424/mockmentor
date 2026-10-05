import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rateLimit } from "@/lib/rateLimit";
import { signupSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(req) {

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
                        headers: { "Retry-After": String(limited.retryAfter) },
                  }
            );
      }

      try {
            const body = await req.json();

            const parsed = signupSchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.issues[0]?.message || "Invalid input";
                  return errorResponse(message, 400);
            }

            const { name, email, password } = parsed.data;

            const existingUser = await prisma.user.findUnique({
                  where: { email },
            });

            if (existingUser) {
                  return errorResponse("Email already registered", 400);
            }

            const hashedPassword = await hashPassword(password);

            const user = await prisma.user.create({
                  data: { name, email, password: hashedPassword },
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