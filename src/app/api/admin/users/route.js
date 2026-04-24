import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET() {

      const auth = await requireAdmin();

      if (auth.error) {
            return NextResponse.json(
                  { error: auth.error },
                  { status: auth.status }
            );
      }

      try {
            const users = await prisma.user.findMany({
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                  },
                  orderBy: { createdAt: "desc" },
            });

            return NextResponse.json(users);
      } catch (error) {
            return NextResponse.json(
                  { error: "Failed to fetch users" },
                  { status: 500 }
            );
      }
}