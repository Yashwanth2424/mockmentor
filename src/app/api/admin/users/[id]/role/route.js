import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { roleSchema } from "@/lib/validators";

export async function PATCH(req, { params }) {

      try {
            requireAdmin(req);
      } catch (err) {
            return errorResponse(
                  err.message,
                  err.message === "Forbidden" ? 403 : 401
            );
      }

      try {
            const { id } = await params;

            const body = await req.json();

            // ZOD VALIDATION
            const parsed = roleSchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.errors[0]?.message || "Invalid role";
                  return errorResponse(message, 400);
            }

            const { role } = parsed.data;

            const updated = await prisma.user.update({
                  where: { id },
                  data: { role },
            });

            return successResponse(updated);

      } catch (err) {
            console.error("ROLE UPDATE ERROR:", err);
            return errorResponse("Failed to update role", 500);
      }
}