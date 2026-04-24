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

            const { topic, date } = await req.json();

            if (!topic || !date) {
                  return NextResponse.json(
                        { error: "Missing fields" },
                        { status: 400 }
                  );
            }

            const selectedDate = new Date(date);
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


            const minutes = selectedDate.getMinutes();

            if (minutes !== 0 && minutes !== 30) {
                  return NextResponse.json(
                        { error: "Only 30-minute slots allowed (00 or 30)" },
                        { status: 400 }
                  );
            }


            const interview = await prisma.interview.create({
                  data: {
                        topic,
                        date: selectedDate,
                        user: {
                              connect: { id: decoded.id },
                        },
                  },
            });


            const user = await prisma.user.findUnique({
                  where: { id: decoded.id },
            });

            console.log("USER EMAIL:", user?.email);

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
            console.error(err);
            return NextResponse.json(
                  { error: "Booking failed" },
                  { status: 500 }
            );
      }
}