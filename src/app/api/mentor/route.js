import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(req) {
  try {
    requireAuth(req);

    const mentors = await prisma.user.findMany({
      where: {
        role: "MENTOR",
      },

      select: {
        id: true,
        name: true,

        availability: {
          select: {
            id: true,
            dayOfWeek: true,
            startHour: true,
            endHour: true,
          },
        },
      },
    });

    return successResponse(mentors);
  } catch (err) {
    if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

    console.error("MENTOR FETCH ERROR:", err);

    return errorResponse("Failed to fetch mentors", 500);
  }
}
