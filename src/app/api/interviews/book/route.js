import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { sendEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rateLimit";
import { bookingSchema } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function POST(req) {

      // RATE LIMIT
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
                  }
            );
      }

      try {
            const user = requireAuth(req);

            const body = await req.json();

            // ZOD VALIDATION
            const parsed = bookingSchema.safeParse(body);

            if (!parsed.success) {
                  const message = parsed.error.errors[0]?.message || "Invalid input";
                  return errorResponse(message, 400);
            }

            const { topic: cleanTopic, date, mentorId } = parsed.data;

            // DATE
            const selectedDate = new Date(date);
            selectedDate.setSeconds(0, 0);

            if (isNaN(selectedDate)) {
                  return errorResponse("Invalid date format", 400);
            }

            // TOMORROW ONLY
            const now = new Date();
            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            if (selectedDate < tomorrow) {
                  return errorResponse("Booking allowed only from tomorrow", 400);
            }

            // SLOT VALIDATION
            const minutes = selectedDate.getMinutes();
            if (minutes !== 0 && minutes !== 30) {
                  return errorResponse("Only 30-minute slots allowed", 400);
            }

            // STUDENT CONFLICT
            const existingStudentInterview = await prisma.interview.findFirst({
                  where: {
                        userId: user.id,
                        date: selectedDate,
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (existingStudentInterview) {
                  return errorResponse("You already have an interview at this time", 400);
            }

            // MENTOR
            const mentor = await prisma.user.findUnique({
                  where: { id: mentorId },
                  include: { availability: true },
            });

            if (!mentor || mentor.role !== "MENTOR") {
                  return errorResponse("Invalid mentor", 400);
            }

            // MENTOR CONFLICT
            const existingMentorInterview = await prisma.interview.findFirst({
                  where: {
                        mentorId,
                        date: selectedDate,
                        status: { in: ["PENDING", "ACCEPTED"] },
                  },
            });

            if (existingMentorInterview) {
                  return errorResponse("Mentor already booked for this time", 400);
            }

            // AVAILABILITY
            const selectedHour = selectedDate.getHours();
            const selectedDay = selectedDate.getDay();

            const dayAvailability = mentor.availability.find(
                  (a) => a.dayOfWeek === selectedDay
            );

            if (!dayAvailability) {
                  return errorResponse("Mentor not available on this day", 400);
            }

            if (
                  selectedHour < dayAvailability.startHour ||
                  selectedHour >= dayAvailability.endHour
            ) {
                  return errorResponse("Time outside mentor availability", 400);
            }

            // CREATE INTERVIEW
            const interview = await prisma.interview.create({
                  data: {
                        topic: cleanTopic,
                        date: selectedDate,
                        status: "PENDING",
                        user: { connect: { id: user.id } },
                        mentor: { connect: { id: mentorId } },
                  },
                  include: {
                        mentor: true,
                        user: true,
                  },
            });

            // EMAIL
            try {
                  await sendEmail({
                        to: interview.user.email,
                        subject: "Interview Scheduled - MockMentor",
                        html: `
                              <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
                                    <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
                                          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:20px; text-align:center; color:white;">
                                                <h1 style="margin:0;">MockMentor</h1>
                                                <p style="margin:5px 0 0; font-size:14px;">Interview Practice Platform</p>
                                          </div>
                                          <div style="padding:24px;">
                                                <h2 style="margin-top:0;">Interview Confirmed</h2>
                                                <p style="color:#374151;">Your interview has been successfully scheduled.</p>
                                                <div style="background:#f3f4f6; padding:16px; border-radius:8px; margin:20px 0;">
                                                      <p><strong>Topic:</strong> ${interview.topic}</p>
                                                      <p><strong>Date:</strong> ${new Date(interview.date).toLocaleString()}</p>
                                                      <p><strong>Mentor:</strong> ${interview.mentor.name}</p>
                                                </div>
                                                <div style="text-align:center; margin-top:20px;">
                                                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
                                                            style="display:inline-block; padding:12px 20px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none;">
                                                            Go to Dashboard
                                                      </a>
                                                </div>
                                          </div>
                                          <div style="padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
                                                © ${new Date().getFullYear()} MockMentor
                                          </div>
                                    </div>
                              </div>
                        `,
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