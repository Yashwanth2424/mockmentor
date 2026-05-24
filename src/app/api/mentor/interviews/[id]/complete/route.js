import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(req, { params }) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const { id } = await params;

            // BODY
            const { rating, feedback, strengths, improvements } = await req.json();

            // VALIDATION
            if (!rating || rating < 1 || rating > 5) {
                  return errorResponse("Rating must be between 1 and 5", 400);
            }

            const cleanFeedback = feedback?.trim();
            const cleanStrengths = strengths?.trim();
            const cleanImprovements = improvements?.trim();

            if (!cleanFeedback || cleanFeedback.length < 5) {
                  return errorResponse("Feedback must be at least 5 characters", 400);
            }

            if (cleanFeedback.length > 1000) {
                  return errorResponse("Feedback too long", 400);
            }

            // FIND
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

            // STATUS
            if (interview.status === "COMPLETED") {
                  return errorResponse("Interview already completed", 400);
            }

            if (interview.status !== "ACCEPTED") {
                  return errorResponse("Only accepted interviews can be completed", 400);
            }

            // UPDATE
            const updated = await prisma.interview.update({
                  where: { id },
                  data: {
                        status: "COMPLETED",
                        rating,
                        feedback: cleanFeedback,
                        strengths: cleanStrengths,
                        improvements: cleanImprovements,
                        completedAt: new Date(),
                  },
            });

            return successResponse(updated);

      } catch (err) {
            console.error("COMPLETE ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Server error", 500);
      }
}