import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(req) {
      try {
            // Get token from cookie
            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            // Decode token → get user ID
            const decoded = verifyToken(token);

            // Fetch interviews for THIS user only
            const interviews = await prisma.interview.findMany({
                  where: { userId: decoded.userId },
                  orderBy: { date: "desc" },
            });

            return NextResponse.json(interviews);

      } catch (err) {
            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}