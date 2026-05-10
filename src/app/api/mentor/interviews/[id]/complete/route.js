import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req, context) {



      try {
            const params = await context.params;

            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded = verifyToken(token);

            const {
                  rating,
                  feedback,
                  strengths,
                  improvements,
            } = await req.json();

            // VALIDATION

            if (!rating || rating < 1 || rating > 5) {
                  return NextResponse.json(
                        { error: "Rating must be between 1 and 5" },
                        { status: 400 }
                  );
            }

            // FIND INTERVIEW

            const interview = await prisma.interview.findUnique({
                  where: {
                        id: params.id,
                  },
            });

            if (!interview) {
                  return NextResponse.json(
                        { error: "Interview not found" },
                        { status: 404 }
                  );
            }

            // SECURITY CHECK

            if (interview.mentorId !== decoded.id) {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            // ONLY ACCEPTED INTERVIEWS CAN COMPLETE

            if (interview.status !== "ACCEPTED") {
                  return NextResponse.json(
                        { error: "Only accepted interviews can be completed" },
                        { status: 400 }
                  );
            }

            // UPDATE

            const updated = await prisma.interview.update({
                  where: {
                        id: params.id,
                  },
                  data: {
                        status: "COMPLETED",
                        rating,
                        feedback,
                        strengths,
                        improvements,
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