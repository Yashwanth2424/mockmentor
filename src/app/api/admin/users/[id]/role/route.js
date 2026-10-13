import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { roleSchema } from "@/lib/validators";

export async function PATCH(req, { params }) {
  let admin;

  try {
    admin = await requireAdmin(req);
  } catch (err) {
    return errorResponse(err.message, err.message === "Forbidden" ? 403 : 401);
  }

  try {
    const { id } = await params;

    if (id === admin.id) {
      return errorResponse("You cannot change your own role", 400);
    }

    const body = await req.json();

    const parsed = roleSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid role";
      return errorResponse(message, 400);
    }

    const { role } = parsed.data;

    const target = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!target) {
      return errorResponse("User not found", 404);
    }

    if (target.role === "SUPER_ADMIN") {
      return errorResponse("The Super Admin cannot be changed here", 403);
    }

    if (admin.role !== "SUPER_ADMIN" && (target.role === "ADMIN" || role === "ADMIN")) {
      return errorResponse("Only the Super Admin can manage admins", 403);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("ROLE UPDATE ERROR:", err);
    return errorResponse("Failed to update role", 500);
  }
}
