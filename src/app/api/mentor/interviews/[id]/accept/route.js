import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

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

            //  STATUS VALIDATION 

            if (interview.status === "ACCEPTED") {
                  return NextResponse.json(
                        {
                              error:
                                    "Interview already accepted",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (
                  interview.status === "COMPLETED"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Completed interviews cannot be accepted",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (
                  interview.status === "CANCELLED"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Cancelled interviews cannot be accepted",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (
                  interview.status === "REJECTED"
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Rejected interviews cannot be accepted",
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
                              status: "ACCEPTED",
                        },
                  });

            return NextResponse.json(updated);

      } catch (err) {

            console.error("ACCEPT ERROR:", err);

            return NextResponse.json(
                  { error: "Failed to accept" },
                  { status: 500 }
            );
      }
}