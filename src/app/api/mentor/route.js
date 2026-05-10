import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
      try {
            const mentors = await prisma.user.findMany({
                  where: { role: "MENTOR" },
                  include: {
                        availability: true,
                  },
            });

            return NextResponse.json(mentors);
      } catch (err) {
            console.error(err);
            return NextResponse.json(
                  { error: "Failed to fetch mentors" },
                  { status: 500 }
            );
      }
}