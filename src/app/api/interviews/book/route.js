import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { sendEmail } from "@/lib/email";
import { bookingConfirmationEmail } from "@/lib/emailTemplates";
import { rateLimit } from "@/lib/rateLimit";
import { bookingSchema } from "@/lib/validators";
import { NextResponse } from "next/server";
import { formatDateTime, getZonedParts } from "@/lib/time";

const publicUser = { select: { id: true, name: true, email: true } };

export async function POST(req) {
  const limited = rateLimit(req, {
    key: "booking",
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (limited) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many booking attempts. Try again in ${limited.retryAfter} seconds.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfter) },
      },
    );
  }

  try {
    const user = requireAuth(req);

    const body = await req.json();

    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Invalid input";
      return errorResponse(message, 400);
    }

    const { topic: cleanTopic, date, mentorId } = parsed.data;

    const selectedDate = new Date(date);
    selectedDate.setSeconds(0, 0);

    if (isNaN(selectedDate)) {
      return errorResponse("Invalid date format", 400);
    }

    const slot = getZonedParts(selectedDate);
    const today = getZonedParts(new Date());

    if (slot.dateString <= today.dateString) {
      return errorResponse("Booking allowed only from tomorrow", 400);
    }

    if (slot.minute !== 0 && slot.minute !== 30) {
      return errorResponse("Only 30-minute slots allowed", 400);
    }

    const existingStudentInterview = await prisma.interview.findFirst({
      where: {
        userId: user.id,
        date: selectedDate,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existingStudentInterview) {
      return errorResponse("You already have an interview at this time", 409);
    }

    const mentor = await prisma.user.findUnique({
      where: { id: mentorId },
      include: { availability: true },
    });

    if (!mentor || mentor.role !== "MENTOR") {
      return errorResponse("Invalid mentor", 400);
    }

    const existingMentorInterview = await prisma.interview.findFirst({
      where: {
        mentorId,
        date: selectedDate,
        status: { in: ["PENDING", "ACCEPTED"] },
      },
    });

    if (existingMentorInterview) {
      return errorResponse("Mentor already booked for this time", 409);
    }

    const dayAvailability = mentor.availability.find((a) => a.dayOfWeek === slot.weekday);

    if (!dayAvailability) {
      return errorResponse("Mentor not available on this day", 400);
    }

    if (slot.hour < dayAvailability.startHour || slot.hour >= dayAvailability.endHour) {
      return errorResponse("Time outside mentor availability", 400);
    }

    let interview;
    try {
      interview = await prisma.interview.create({
        data: {
          topic: cleanTopic,
          date: selectedDate,
          status: "PENDING",
          user: { connect: { id: user.id } },
          mentor: { connect: { id: mentorId } },
        },
        include: {
          mentor: publicUser,
          user: publicUser,
        },
      });
    } catch (err) {
      if (err.code === "P2002") {
        return errorResponse("This slot was just booked. Please pick another time.", 409);
      }
      throw err;
    }

    try {
      await sendEmail({
        to: interview.user.email,
        subject: "Interview Scheduled - MockMentor",
        html: bookingConfirmationEmail({
          topic: interview.topic,
          date: formatDateTime(interview.date),
          mentorName: interview.mentor.name,
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
        }),
      });
    } catch (emailErr) {
      console.error("EMAIL ERROR:", emailErr);
    }

    return successResponse(interview, 201);
  } catch (err) {
    console.error("BOOKING ERROR:", err);

    if (err.message === "Unauthorized") {
      return errorResponse("Unauthorized", 401);
    }

    return errorResponse("Booking failed", 500);
  }
}
