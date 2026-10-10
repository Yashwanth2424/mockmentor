import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { rescheduleSchema } from "@/lib/validators";
import { getZonedParts } from "@/lib/time";

const publicUser = { select: { id: true, name: true, email: true } };

export async function PATCH(req, { params }) {
      try {
            const user = requireAuth(req);

            const { id } = await params;

            const body = await req.json();

            const parsed = rescheduleSchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.issues[0]?.message || "Invalid input";
                  return errorResponse(message, 400);
            }

            const { date, mentorId } = parsed.data;

            const selectedDate = new Date(date);
            selectedDate.setSeconds(0, 0);

            if (isNaN(selectedDate.getTime())) {
                  return errorResponse("Invalid date", 400);
            }

            const slot = getZonedParts(selectedDate);
            const today = getZonedParts(new Date());

            if (slot.dateString <= today.dateString) {
                  return errorResponse("Rescheduling allowed only from tomorrow", 400);
            }

            if (slot.minute !== 0 && slot.minute !== 30) {
                  return errorResponse("Only 30-minute slots allowed", 400);
            }

            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            if (!interview) {
                  return errorResponse("Interview not found", 404);
            }

            if (interview.userId !== user.id) {
                  return errorResponse("Forbidden", 403);
            }

            if (!["PENDING", "ACCEPTED"].includes(interview.status)) {
                  return errorResponse("Cannot reschedule this interview", 400);
            }

            const mentor = await prisma.user.findUnique({
                  where: { id: mentorId },
                  include: { availability: true },
            });

            if (!mentor || mentor.role !== "MENTOR") {
                  return errorResponse("Invalid mentor", 400);
            }

            const availability = mentor.availability.find(
                  (a) => Number(a.dayOfWeek) === slot.weekday
            );

            if (!availability) {
                  return errorResponse("Mentor unavailable on selected day", 400);
            }

            if (
                  slot.hour < availability.startHour ||
                  slot.hour >= availability.endHour
            ) {
                  return errorResponse("Selected time outside mentor availability", 400);
            }

            const mentorConflict = await prisma.interview.findFirst({
                  where: {
                        mentorId,
                        date: selectedDate,
                        id: { not: id },
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (mentorConflict) {
                  return errorResponse("Mentor already booked", 409);
            }

            const studentConflict = await prisma.interview.findFirst({
                  where: {
                        userId: user.id,
                        date: selectedDate,
                        id: { not: id },
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (studentConflict) {
                  return errorResponse("You already have another interview at this time", 409);
            }

            let updatedInterview;
            try {
                  updatedInterview = await prisma.interview.update({
                        where: { id },
                        data: {
                              date: selectedDate,
                              mentorId,
                              status: "PENDING",
                        },
                        include: { mentor: publicUser },
                  });
            } catch (err) {
                  if (err.code === "P2002") {
                        return errorResponse("This slot was just booked. Please pick another time.", 409);
                  }
                  throw err;
            }

            return successResponse(updatedInterview);

      } catch (err) {
            console.error("RESCHEDULE ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

            return errorResponse("Failed to reschedule interview", 500);
      }
}