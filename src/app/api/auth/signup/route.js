import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req) {
      try {

            const body = await req.json();

            const name = body.name?.trim();
            const email = body.email?.trim().toLowerCase();
            const password = body.password?.trim();

            //  VALIDATION 

            if (!name || !email || !password) {
                  return NextResponse.json(
                        { error: "All fields are required" },
                        { status: 400 }
                  );
            }

            if (name.length < 2) {
                  return NextResponse.json(
                        { error: "Name is too short" },
                        { status: 400 }
                  );
            }

            const emailRegex =
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                  return NextResponse.json(
                        { error: "Invalid email address" },
                        { status: 400 }
                  );
            }

            if (password.length < 6) {
                  return NextResponse.json(
                        { error: "Password must be at least 6 characters" },
                        { status: 400 }
                  );
            }

            //  EXISTING USER 

            const existingUser = await prisma.user.findUnique({
                  where: {
                        email,
                  },
            });

            if (existingUser) {
                  return NextResponse.json(
                        { error: "Email already registered" },
                        { status: 400 }
                  );
            }

            //  HASH PASSWORD 

            const hashedPassword =
                  await hashPassword(password);

            //  CREATE USER 

            const user = await prisma.user.create({
                  data: {
                        name,
                        email,
                        password: hashedPassword,
                  },
            });

            return NextResponse.json(
                  {
                        message: "User created successfully",
                        userId: user.id,
                  },
                  { status: 201 }
            );

      } catch (error) {

            console.error("Signup Error:", error);

            return NextResponse.json(
                  { error: "Internal server error" },
                  { status: 500 }
            );
      }
}