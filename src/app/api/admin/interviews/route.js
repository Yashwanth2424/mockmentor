import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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

            return NextResponse.json({ success: true, data: interviews });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Server error" },
                  { status: 500 }
            );
      }
}