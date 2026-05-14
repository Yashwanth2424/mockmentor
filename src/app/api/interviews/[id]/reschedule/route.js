import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req, context) {
      try {

            const { id } = await context.params;

            const token =
                  req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded =
                  verifyToken(token);

            const {
                  date,
                  mentorId,
            } = await req.json();

            if (!date || !mentorId) {
                  return NextResponse.json(
                        {
                              error:
                                    "Missing required fields",
                        },
                        { status: 400 }
                  );
            }

            const selectedDate =
                  new Date(date);

            if (
                  isNaN(selectedDate.getTime())
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Invalid date",
                        },
                        { status: 400 }
                  );
            }

            // FUTURE DATE ONLY

            const now = new Date();

            if (selectedDate <= now) {
                  return NextResponse.json(
                        {
                              error:
                                    "Please select a future time",
                        },
                        { status: 400 }
                  );
            }

            // INTERVIEW

            const interview =
                  await prisma.interview.findUnique(
                        {
                              where: { id },
                        }
                  );

            if (!interview) {
                  return NextResponse.json(
                        {
                              error:
                                    "Interview not found",
                        },
                        { status: 404 }
                  );
            }

            // OWNER CHECK

            if (
                  interview.userId !==
                  decoded.id
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Forbidden",
                        },
                        { status: 403 }
                  );
            }

            // ONLY PENDING/ACCEPTED

            if (
                  ![
                        "PENDING",
                        "ACCEPTED",
                  ].includes(
                        interview.status
                  )
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Cannot reschedule this interview",
                        },
                        { status: 400 }
                  );
            }

            // MENTOR

            const mentor =
                  await prisma.user.findUnique(
                        {
                              where: {
                                    id: mentorId,
                              },
                              include: {
                                    availability: true,
                              },
                        }
                  );

            if (
                  !mentor ||
                  mentor.role !== "MENTOR"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Invalid mentor",
                        },
                        { status: 400 }
                  );
            }

            // AVAILABILITY

            const selectedDay =
                  selectedDate.getDay();

            const selectedHour =
                  selectedDate.getHours();

            const availability =
                  mentor.availability.find(
                        (a) =>
                              a.dayOfWeek ===
                              selectedDay
                  );

            if (!availability) {
                  return NextResponse.json(
                        {
                              error:
                                    "Mentor unavailable on selected day",
                        },
                        { status: 400 }
                  );
            }

            if (
                  selectedHour <
                  availability.startHour ||
                  selectedHour >=
                  availability.endHour
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Selected time outside mentor availability",
                        },
                        { status: 400 }
                  );
            }

            // MENTOR CONFLICT

            const mentorConflict =
                  await prisma.interview.findFirst(
                        {
                              where: {
                                    mentorId,
                                    date:
                                          selectedDate,
                                    id: {
                                          not:
                                                id,
                                    },
                              },
                        }
                  );

            if (mentorConflict) {
                  return NextResponse.json(
                        {
                              error:
                                    "Mentor already booked",
                        },
                        { status: 400 }
                  );
            }

            // STUDENT CONFLICT

            const studentConflict =
                  await prisma.interview.findFirst(
                        {
                              where: {
                                    userId:
                                          decoded.id,
                                    date:
                                          selectedDate,
                                    id: {
                                          not:
                                                id,
                                    },
                              },
                        }
                  );

            if (studentConflict) {
                  return NextResponse.json(
                        {
                              error:
                                    "You already have another interview at this time",
                        },
                        { status: 400 }
                  );
            }

            // UPDATE

            const updated =
                  await prisma.interview.update(
                        {
                              where: { id },

                              data: {
                                    date:
                                          selectedDate,
                                    mentorId,
                                    status:
                                          "PENDING",
                              },

                              include: {
                                    mentor: true,
                              },
                        }
                  );

            return NextResponse.json(
                  updated
            );

      } catch (err) {

            console.error(
                  "RESCHEDULE ERROR:",
                  err
            );

            return NextResponse.json(
                  {
                        error:
                              "Failed to reschedule interview",
                  },
                  { status: 500 }
            );
      }
}