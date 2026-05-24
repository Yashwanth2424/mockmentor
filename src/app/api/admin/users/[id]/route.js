import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(req, { params }) {

      let admin;

      try {
            admin = requireAdmin(req);
      } catch (err) {
            return NextResponse.json(
                  { success: false, error: err.message },
                  { status: err.message === "Forbidden" ? 403 : 401 }
            );
      }

      try {
            const { id } = await params;

            if (admin.id === id) {
                  return NextResponse.json(
                        { success: false, error: "You cannot delete your own account" },
                        { status: 400 }
                  );
            }

            await prisma.user.delete({
                  where: { id },
            });

            return NextResponse.json({ success: true, data: { message: "User deleted" } });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Delete failed" },
                  { status: 500 }
            );
      }
}