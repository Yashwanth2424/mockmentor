import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(req) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const { availability } = await req.json();

            if (!Array.isArray(availability)) {
                  return errorResponse("Invalid data", 400);
            }

            // Validate each availability entry
            for (const a of availability) {
                  const day = Number(a.dayOfWeek);
                  const start = parseInt(a.startHour);
                  const end = parseInt(a.endHour);

                  if (day < 0 || day > 6) {
                        return errorResponse("Invalid day of week", 400);
                  }

                  if (start < 0 || start > 23 || end < 1 || end > 24) {
                        return errorResponse("Invalid hours", 400);
                  }

                  if (start >= end) {
                        return errorResponse("Start hour must be before end hour", 400);
                  }
            }

            // Transaction to avoid partial updates
            await prisma.$transaction([
                  prisma.mentorAvailability.deleteMany({
                        where: { mentorId: mentor.id },
                  }),
                  prisma.mentorAvailability.createMany({
                        data: availability.map((a) => ({
                              mentorId: mentor.id,
                              dayOfWeek: Number(a.dayOfWeek),
                              startHour: parseInt(a.startHour),
                              endHour: parseInt(a.endHour),
                        })),
                  }),
            ]);

            return successResponse({ message: "Availability updated" });

      } catch (err) {
            console.error("AVAILABILITY ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Failed to update availability", 500);
      }
}