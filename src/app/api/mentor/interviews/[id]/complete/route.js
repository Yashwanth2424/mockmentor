import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { changeInterviewStatus } from "@/lib/changeInterviewStatus";
import { completeSchema } from "@/lib/validators";

export async function PATCH(req, { params }) {
  try {
    const mentor = requireRole(req, ["MENTOR"]);

    const { id } = await params;

    const parsed = completeSchema.safeParse(await req.json());

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input";
      return errorResponse(message, 400);
    }

    const { rating, feedback, strengths, improvements } = parsed.data;

    const result = await changeInterviewStatus({
      id,
      action: "complete",
      owner: { mentorId: mentor.id },
      where: { date: { lte: new Date() } },
      data: {
        rating,
        feedback,
        strengths,
        improvements,
        completedAt: new Date(),
      },
    });

    if (result.interview?.status === "ACCEPTED" && result.interview.date > new Date()) {
      return errorResponse("You can complete an interview only after it has started", 400);
    }

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
