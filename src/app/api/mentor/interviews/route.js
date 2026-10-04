import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

const publicUser = { select: { id: true, name: true, email: true } };

export async function GET(req) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const interviews = await prisma.interview.findMany({
                  where: { mentorId: mentor.id },
                  include: { user: publicUser },
                  orderBy: { date: "desc" },
            });

            return successResponse(interviews);

      } catch (err) {
            console.error("MENTOR INTERVIEWS ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Server error", 500);
      }
}