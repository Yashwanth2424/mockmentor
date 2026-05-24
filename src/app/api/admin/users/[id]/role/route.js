import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

const ALLOWED_ROLES = ["STUDENT", "MENTOR", "ADMIN", "SUPER_ADMIN"];

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
            const { role } = await req.json();

            if (!role || !ALLOWED_ROLES.includes(role)) {
                  return NextResponse.json(
                        { success: false, error: "Invalid role" },
                        { status: 400 }
                  );
            }

            const updated = await prisma.user.update({
                  where: { id },
                  data: { role },
            });

            return NextResponse.json({ success: true, data: updated });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Failed to update role" },
                  { status: 500 }
            );
      }
}