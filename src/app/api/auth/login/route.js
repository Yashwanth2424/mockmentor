import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {

      console.log("JWT_SECRET:", process.env.JWT_SECRET);

      try {
            const { email, password } = await req.json();

            // Find user
            const user = await prisma.user.findUnique({
                  where: { email },
            });

            if (!user) {
                  return NextResponse.json(
                        { error: "Invalid email or password" },
                        { status: 401 }
                  );
            }

            //  Compare password
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                  return NextResponse.json(
                        { error: "Invalid email or password" },
                        { status: 401 }
                  );
            }

            //  Create token
            const token = jwt.sign(
                  { id: user.id, role: user.role },
                  process.env.JWT_SECRET,
                  { expiresIn: "1d" }
            );

            //  Set cookie
            const response = NextResponse.json({
                  message: "Login successful",
                  role: user.role,
            });

            response.cookies.set({
                  name: "token",
                  value: token,
                  httpOnly: true,
                  secure: false,      // true only on HTTPS
                  sameSite: "lax",
                  path: "/",
                  maxAge: 60 * 60 * 24, // 1 day
            });

            return response;
      } catch (error) {
            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}