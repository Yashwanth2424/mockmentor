import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {

      try {
            requireAdmin(req);
      } catch (err) {
            return NextResponse.json(
                  { success: false, error: err.message },
                  { status: err.message === "Forbidden" ? 403 : 401 }
            );
      }

      try {
            const { id } = await params;

            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            if (!interview) {
                  return NextResponse.json(
                        { success: false, error: "Interview not found" },
                        { status: 404 }
                  );
            }

            if (interview.status === "CANCELLED") {
                  return NextResponse.json(
                        { success: false, error: "Interview is already cancelled" },
                        { status: 400 }
                  );
            }

            const updated = await prisma.interview.update({
                  where: { id },
                  data: { status: "CANCELLED" },
            });

            return NextResponse.json({ success: true, data: updated });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Failed to cancel" },
                  { status: 500 }
            );
      }
}