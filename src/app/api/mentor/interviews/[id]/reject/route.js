import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(req, { params }) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const { id } = await params;

            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            if (!interview) {
                  return errorResponse("Interview not found", 404);
            }

            // OWNERSHIP
            if (interview.mentorId !== mentor.id) {
                  return errorResponse("Forbidden", 403);
            }

            // STATUS VALIDATION
            if (interview.status === "REJECTED") {
                  return errorResponse("Interview already rejected", 400);
            }

            if (interview.status === "COMPLETED") {
                  return errorResponse("Completed interviews cannot be rejected", 400);
            }

            if (interview.status === "CANCELLED") {
                  return errorResponse("Cancelled interviews cannot be rejected", 400);
            }

            if (interview.status === "ACCEPTED") {
                  return errorResponse("Accepted interviews cannot be rejected", 400);
            }

            // UPDATE
            const updated = await prisma.interview.update({
                  where: { id },
                  data: { status: "REJECTED" },
            });

            return successResponse(updated);

      } catch (err) {
            console.error("REJECT ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Failed to reject", 500);
      }
}