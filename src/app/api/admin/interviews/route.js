import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {

      // Admin / Super Admin protection
      const auth = await requireAdmin();

      if (auth.error) {
            return NextResponse.json(
                  { error: auth.error },
                  { status: auth.status }
            );
      }

      try {
            //  Fetch ALL interviews + user info
            const interviews = await prisma.interview.findMany({
                  include: {
                        user: {
                              select: {
                                    name: true,
                                    email: true,
                                    role: true,
                              },
                        },
                  },
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