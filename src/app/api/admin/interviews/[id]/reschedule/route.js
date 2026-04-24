import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req, { params }) {
      try {
            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const decoded = verifyToken(token);
            const { date } = await req.json();

            const interview = await prisma.interview.findUnique({
                  where: { id: params.id },
            });

            if (!interview || interview.userId !== decoded.id) {
                  return NextResponse.json({ error: "Not allowed" }, { status: 403 });
            }

            const updated = await prisma.interview.update({
                  where: { id: params.id },
                  data: {
                        date: new Date(date),
                        status: "PENDING",
                  },
            });

            return NextResponse.json(updated);

      } catch (err) {
            return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 });
      }
}