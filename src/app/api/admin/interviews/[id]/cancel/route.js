import { requireAdmin } from "@/lib/adminAuth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { changeInterviewStatus } from "@/lib/changeInterviewStatus";

export async function PATCH(req, { params }) {
  try {
    await requireAdmin(req);
  } catch (err) {
    return errorResponse(err.message, err.message === "Forbidden" ? 403 : 401);
  }

  try {
    const { id } = await params;

    const result = await changeInterviewStatus({ id, action: "cancel" });

    if (result.error) {
      return errorResponse(result.error, result.status);
    }

    return successResponse(result.interview);
  } catch (err) {
    console.error("ADMIN CANCEL ERROR:", err);
    return errorResponse("Failed to cancel", 500);
  }
}
