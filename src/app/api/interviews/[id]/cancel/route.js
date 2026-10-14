import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { changeInterviewStatus } from "@/lib/changeInterviewStatus";

export async function PATCH(req, { params }) {
  try {
    const user = requireAuth(req);
    const { id } = await params;

    const result = await changeInterviewStatus({
      id,
      action: "cancel",
      owner: { userId: user.id },
    });

    if (result.error) {
      return errorResponse(result.error, result.status);
    }

    return successResponse(result.interview);
  } catch (err) {
    console.error("CANCEL ERROR:", err);

    if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    return errorResponse("Server error", 500);
  }
}
