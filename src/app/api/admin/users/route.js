import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(req) {

      try {
            requireAdmin(req);
      } catch (err) {
            return NextResponse.json(
                  { success: false, error: err.message },
                  { status: err.message === "Forbidden" ? 403 : 401 }
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

            return NextResponse.json({ success: true, data: users });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Failed to fetch users" },
                  { status: 500 }
            );
      }
}