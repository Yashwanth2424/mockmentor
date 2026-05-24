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
            if (interview.status === "ACCEPTED") {
                  return errorResponse("Interview already accepted", 400);
            }

            if (interview.status === "COMPLETED") {
                  return errorResponse("Completed interviews cannot be accepted", 400);
            }

            if (interview.status === "CANCELLED") {
                  return errorResponse("Cancelled interviews cannot be accepted", 400);
            }

            if (interview.status === "REJECTED") {
                  return errorResponse("Rejected interviews cannot be accepted", 400);
            }

            // UPDATE
            const updated = await prisma.interview.update({
                  where: { id },
                  data: { status: "ACCEPTED" },
            });

            return successResponse(updated);

      } catch (err) {
            console.error("ACCEPT ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Failed to accept", 500);
      }
}