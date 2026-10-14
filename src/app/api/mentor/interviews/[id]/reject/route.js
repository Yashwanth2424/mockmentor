import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { changeInterviewStatus } from "@/lib/changeInterviewStatus";

export async function PATCH(req, { params }) {
  try {
    const mentor = requireRole(req, ["MENTOR"]);
    const { id } = await params;

    const result = await changeInterviewStatus({
      id,
      action: "reject",
      owner: { mentorId: mentor.id },
    });

    if (result.error) {
      return errorResponse(result.error, result.status);
    }

    return successResponse(result.interview);
  } catch (err) {
    console.error("REJECT ERROR:", err);

    if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
    if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

    return errorResponse("Failed to reject", 500);
  }
}
