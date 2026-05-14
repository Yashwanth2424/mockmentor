import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req, context) {

      try {

            const params = await context.params;

            const token = req.cookies.get("token")?.value;

            //  AUTH 

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded = verifyToken(token);

            if (decoded.role !== "MENTOR") {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            //  ID 

            const { id } = params;

            if (!id) {
                  return NextResponse.json(
                        { error: "Missing interview ID" },
                        { status: 400 }
                  );
            }

            //  BODY 

            const {
                  rating,
                  feedback,
                  strengths,
                  improvements,
            } = await req.json();

            //  VALIDATION 

            if (
                  !rating ||
                  rating < 1 ||
                  rating > 5
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Rating must be between 1 and 5",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            const cleanFeedback =
                  feedback?.trim();

            const cleanStrengths =
                  strengths?.trim();

            const cleanImprovements =
                  improvements?.trim();

            if (
                  !cleanFeedback ||
                  cleanFeedback.length < 5
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Feedback must be at least 5 characters",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (cleanFeedback.length > 1000) {
                  return NextResponse.json(
                        {
                              error:
                                    "Feedback too long",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            //  FIND 

            const interview =
                  await prisma.interview.findUnique({
                        where: {
                              id,
                        },
                  });

            if (!interview) {
                  return NextResponse.json(
                        { error: "Interview not found" },
                        { status: 404 }
                  );
            }

            //  OWNERSHIP 

            if (interview.mentorId !== decoded.id) {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            //  STATUS 

            if (
                  interview.status === "COMPLETED"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Interview already completed",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (
                  interview.status !== "ACCEPTED"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Only accepted interviews can be completed",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            //  UPDATE 

            const updated =
                  await prisma.interview.update({
                        where: {
                              id,
                        },
                        data: {
                              status: "COMPLETED",
                              rating,
                              feedback: cleanFeedback,
                              strengths: cleanStrengths,
                              improvements:
                                    cleanImprovements,
                              completedAt: new Date(),
                        },
                  });

            return NextResponse.json(updated);

      } catch (err) {

            console.error(err);

            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}