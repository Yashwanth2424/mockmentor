import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import { sendEmail } from "@/lib/email";

export async function POST(req) {
      try {
            const token = req.cookies.get("token")?.value;



            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded = verifyToken(token);

            const { topic, date, mentorId } = await req.json();

            //  Clean topic input
            const cleanTopic = topic?.trim();

            //  Validate required fields
            if (!cleanTopic || !date) {
                  return NextResponse.json(
                        { error: "Missing fields" },
                        { status: 400 }
                  );
            }

            //  Normalize date once
            const selectedDate = new Date(date);

            if (isNaN(selectedDate)) {
                  return NextResponse.json(
                        { error: "Invalid date format" },
                        { status: 400 }
                  );
            }

            const now = new Date();

            const tomorrow = new Date();
            tomorrow.setDate(now.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            if (selectedDate < tomorrow) {
                  return NextResponse.json(
                        { error: "Booking allowed only from tomorrow" },
                        { status: 400 }
                  );
            }

            //  Only 30 min slots
            const minutes = selectedDate.getMinutes();

            if (minutes !== 0 && minutes !== 30) {
                  return NextResponse.json(
                        { error: "Only 30-minute slots allowed (00 or 30)" },
                        { status: 400 }
                  );
            }

            //  Prevent student double booking
            const existingStudent = await prisma.interview.findFirst({
                  where: {
                        userId: decoded.id,
                        date: selectedDate,
                  },
            });

            if (existingStudent) {
                  return NextResponse.json(
                        { error: "You already have an interview at this time" },
                        { status: 400 }
                  );
            }


            if (!mentorId) {
                  return NextResponse.json(
                        { error: "Mentor is required" },
                        { status: 400 }
                  );
            }

            // 🔍 Fetch mentor with availability
            const mentor = await prisma.user.findUnique({
                  where: { id: mentorId },
                  include: { availability: true },
            });

            if (!mentor || mentor.role !== "MENTOR") {
                  return NextResponse.json(
                        { error: "Invalid mentor" },
                        { status: 400 }
                  );
            }

            // ❌ check if mentor is busy
            const existing = await prisma.interview.findFirst({
                  where: {
                        mentorId,
                        date: selectedDate,
                  },
            });

            if (existing) {
                  return NextResponse.json(
                        { error: "Mentor already booked for this time" },
                        { status: 400 }
                  );
            }

            // 🔍 check availability
            const selectedHour = selectedDate.getHours();
            const selectedDay = selectedDate.getDay();

            const dayAvailability = mentor.availability.find(
                  (a) => a.dayOfWeek === selectedDay
            );

            if (!dayAvailability) {
                  return NextResponse.json(
                        { error: "Mentor not available on this day" },
                        { status: 400 }
                  );
            }

            if (
                  selectedHour < dayAvailability.startHour ||
                  selectedHour >= dayAvailability.endHour
            ) {
                  return NextResponse.json(
                        { error: "Time outside mentor availability" },
                        { status: 400 }
                  );
            }



            // ✅ Create interview
            const interview = await prisma.interview.create({
                  data: {
                        topic: cleanTopic,
                        date: selectedDate,
                        status: "PENDING",
                        user: {
                              connect: { id: decoded.id },
                        },
                        mentor: {
                              connect: { id: mentorId },
                        },
                  },
            });

            // ✅ Fetch user for email
            const user = await prisma.user.findUnique({
                  where: { id: decoded.id },
            });

            console.log("USER EMAIL:", user?.email);

            // ✅ Send email
            try {
                  await sendEmail({
                        to: user.email,
                        subject: "Interview Scheduled - MockMentor",
                        html: `
                              <div style="font-family: Arial, sans-serif; background:#f9fafb; padding:20px;">
                              
                              <div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden; border:1px solid #e5e7eb;">
                                    
                                    <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed); padding:20px; text-align:center; color:white;">
                                    <h1 style="margin:0;">MockMentor</h1>
                                    <p style="margin:5px 0 0; font-size:14px;">Interview Practice Platform</p>
                                    </div>

                                    <div style="padding:24px;">
                                    <h2 style="margin-top:0;">🎉 Interview Confirmed</h2>
                                    
                                    <p style="color:#374151;">
                                    Your interview has been successfully scheduled. Here are the details:
                                    </p>

                                    <div style="background:#f3f4f6; padding:16px; border-radius:8px; margin:20px 0;">
                                    <p><strong>📌 Topic:</strong> ${interview.topic}</p>
                                    <p><strong>📅 Date:</strong> ${new Date(interview.date).toLocaleString()}</p>
                                    <p><strong>👨‍🏫 Mentor:</strong> ${selectedMentor.name}</p>
                                    </div>

                                    <p style="color:#374151;">
                                    Make sure to prepare well. We’re excited to help you improve!
                                    </p>

                                    <div style="text-align:center; margin-top:20px;">
                                    <a href="http://localhost:3000/dashboard"
                                          style="display:inline-block; padding:12px 20px; background:#4f46e5; color:white; border-radius:8px; text-decoration:none;">
                                          Go to Dashboard
                                    </a>
                                    </div>
                                    </div>

                                    <div style="padding:16px; text-align:center; font-size:12px; color:#9ca3af;">
                                    © ${new Date().getFullYear()} MockMentor. All rights reserved.
                                    </div>

                              </div>
                              </div>
                              `,
                  });
            } catch (err) {
                  console.error("Email failed:", err);
            }

            return NextResponse.json(interview);

      } catch (err) {
            console.error("BOOKING ERROR:", err);
            return NextResponse.json(
                  { error: "Booking failed" },
                  { status: 500 }
            );
      }
}