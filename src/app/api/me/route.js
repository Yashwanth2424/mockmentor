import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

export async function GET() {
      try {
            // Next.js 16 — cookies() is async
            const cookieStore = await cookies();

            const token = cookieStore.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Not authenticated" },
                        { status: 401 }
                  );
            }

            // Verify token using SAME secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                  where: { id: decoded.id },
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                  }
            });

            if (!user) {
                  return NextResponse.json(
                        { error: "User not found" },
                        { status: 404 }
                  );
            }

            return NextResponse.json(user);

      } catch (error) {
            return NextResponse.json(
                  { error: "Invalid token" },
                  { status: 401 }
            );
      }
}