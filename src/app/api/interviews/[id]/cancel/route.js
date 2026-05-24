import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(req, { params }) {
      try {
            const user = requireAuth(req);

            const { id } = await params;

            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            // NOT FOUND
            if (!interview) {
                  return errorResponse("Interview not found", 404);
            }

            // OWNERSHIP
            if (interview.userId !== user.id) {
                  return errorResponse("Forbidden", 403);
            }

            // INVALID STATES
            if (interview.status === "CANCELLED") {
                  return errorResponse("Interview already cancelled", 400);
            }

            if (interview.status === "COMPLETED") {
                  return errorResponse("Completed interviews cannot be cancelled", 400);
            }

            if (interview.status === "REJECTED") {
                  return errorResponse("Rejected interviews cannot be cancelled", 400);
            }

            // UPDATE
            const updated = await prisma.interview.update({
                  where: { id },
                  data: { status: "CANCELLED" },
            });

            return successResponse(updated);

      } catch (err) {
            console.error("CANCEL ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

            return errorResponse("Server error", 500);
      }
}