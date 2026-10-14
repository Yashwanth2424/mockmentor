import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { changeInterviewStatus } from "@/lib/changeInterviewStatus";

export async function PATCH(req, { params }) {
  try {
    const mentor = requireRole(req, ["MENTOR"]);

    const { id } = await params;

    const { rating, feedback, strengths, improvements } = await req.json();

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

    const result = await changeInterviewStatus({
      id,
      action: "complete",
      owner: { mentorId: mentor.id },
      data: {
        rating,
        feedback: cleanFeedback,
        strengths: cleanStrengths,
        improvements: cleanImprovements,
        completedAt: new Date(),
      },
    });

    if (result.error) {
      return errorResponse(result.error, result.status);
    }

    return successResponse(result.interview);
  } catch (err) {
    console.error("COMPLETE ERROR:", err);

    if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
    if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

    return errorResponse("Server error", 500);
  }
}
