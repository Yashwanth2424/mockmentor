import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
      try {
            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded = verifyToken(token);

            const interviews = await prisma.interview.findMany({
                  where: {
                        mentorId: decoded.id,
                  },
                  include: {
                        user: true,
                  },
                  orderBy: {
                        date: "desc",
                  },
            });

            return NextResponse.json(interviews);

      } catch (err) {
            console.error(err);
            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}