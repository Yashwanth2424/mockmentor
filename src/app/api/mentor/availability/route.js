import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { availabilitySchema } from "@/lib/validators";

export async function GET(req) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const availability = await prisma.mentorAvailability.findMany({
                  where: { mentorId: mentor.id },
                  select: { dayOfWeek: true, startHour: true, endHour: true },
                  orderBy: { dayOfWeek: "asc" },
            });

            return successResponse(availability);

      } catch (err) {
            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);
            if (err.message === "Forbidden") return errorResponse("Forbidden", 403);

            return errorResponse("Failed to load availability", 500);
      }
}

export async function PATCH(req) {
      try {
            const mentor = requireRole(req, ["MENTOR"]);

            const body = await req.json();

            const parsed = availabilitySchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.issues[0]?.message || "Invalid input";
                  return errorResponse(message, 400);
            }

            const { availability } = parsed.data;

            await prisma.$transaction([
                  prisma.mentorAvailability.deleteMany({
                        where: { mentorId: mentor.id },
                  }),
                  prisma.mentorAvailability.createMany({
                        data: availability.map((a) => ({
                              mentorId: mentor.id,
                              dayOfWeek: a.dayOfWeek,
                              startHour: a.startHour,
                              endHour: a.endHour,
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