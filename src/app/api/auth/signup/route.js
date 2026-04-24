import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
      try {
            // 1. Get data from request
            const { name, email, password } = await req.json();

            // 2. Validate fields
            if (!name || !email || !password) {
                  return NextResponse.json(
                        { error: "All fields are required" },
                        { status: 400 }
                  );
            }

            // 3. Check if user already exists
            const existingUser = await prisma.user.findUnique({
                  where: { email },
            });

            if (existingUser) {
                  return NextResponse.json(
                        { error: "Email already registered" },
                        { status: 400 }
                  );
            }

            // 4. Hash password
            const hashedPassword = await hashPassword(password);

            // 5. Create user
            const user = await prisma.user.create({
                  data: {
                        name,
                        email,
                        password: hashedPassword,
                  },
            });

            // 6. Send success response
            return NextResponse.json({
                  message: "User created successfully",
                  userId: user.id,
            });

      } catch (error) {
            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}