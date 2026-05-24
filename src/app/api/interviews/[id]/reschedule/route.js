import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function PATCH(req, { params }) {
      try {
            const user = requireAuth(req);

            const { id } = await params;

            // BODY
            const { date, mentorId } = await req.json();

            if (!date || !mentorId) {
                  return errorResponse("Missing required fields", 400);
            }

            // DATE
            const selectedDate = new Date(date);

            if (isNaN(selectedDate.getTime())) {
                  return errorResponse("Invalid date", 400);
            }

            // FUTURE DATE ONLY
            if (selectedDate <= new Date()) {
                  return errorResponse("Please select a future time", 400);
            }

            // SLOT VALIDATION
            const minutes = selectedDate.getMinutes();

            if (minutes !== 0 && minutes !== 30) {
                  return errorResponse("Only 30-minute slots allowed", 400);
            }

            // INTERVIEW
            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            if (!interview) {
                  return errorResponse("Interview not found", 404);
            }

            // OWNERSHIP
            if (interview.userId !== user.id) {
                  return errorResponse("Forbidden", 403);
            }

            // STATUS CHECK
            if (!["PENDING", "ACCEPTED"].includes(interview.status)) {
                  return errorResponse("Cannot reschedule this interview", 400);
            }

            // MENTOR
            const mentor = await prisma.user.findUnique({
                  where: { id: mentorId },
                  include: { availability: true },
            });

            if (!mentor || mentor.role !== "MENTOR") {
                  return errorResponse("Invalid mentor", 400);
            }

            // AVAILABILITY
            const selectedDay = selectedDate.getDay();
            const selectedHour = selectedDate.getHours();

            const availability = mentor.availability.find(
                  (a) => Number(a.dayOfWeek) === selectedDay
            );

            if (!availability) {
                  return errorResponse("Mentor unavailable on selected day", 400);
            }

            if (selectedHour < availability.startHour || selectedHour >= availability.endHour) {
                  return errorResponse("Selected time outside mentor availability", 400);
            }

            // MENTOR CONFLICT
            const mentorConflict = await prisma.interview.findFirst({
                  where: {
                        mentorId,
                        date: selectedDate,
                        id: { not: id },
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (mentorConflict) {
                  return errorResponse("Mentor already booked", 400);
            }

            // STUDENT CONFLICT
            const studentConflict = await prisma.interview.findFirst({
                  where: {
                        userId: user.id,
                        date: selectedDate,
                        id: { not: id },
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (studentConflict) {
                  return errorResponse("You already have another interview at this time", 400);
            }

            // UPDATE
            const updatedInterview = await prisma.interview.update({
                  where: { id },
                  data: {
                        date: selectedDate,
                        mentorId,
                        status: "PENDING",
                  },
                  include: { mentor: true },
            });

            return successResponse(updatedInterview);

      } catch (err) {
            console.error("RESCHEDULE ERROR:", err);

            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

            return errorResponse("Failed to reschedule interview", 500);
      }
}