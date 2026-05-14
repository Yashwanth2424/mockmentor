import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req, context) {

      const params = await context.params;

      try {

            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            const decoded = verifyToken(token);

            const interview = await prisma.interview.findUnique({
                  where: {
                        id: params.id,
                  },
            });

            //  NOT FOUND 

            if (!interview) {
                  return NextResponse.json(
                        { error: "Interview not found" },
                        { status: 404 }
                  );
            }

            //  OWNERSHIP 

            if (interview.userId !== decoded.id) {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            //  INVALID STATES 

            if (interview.status === "CANCELLED") {
                  return NextResponse.json(
                        {
                              error:
                                    "Interview already cancelled",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (interview.status === "COMPLETED") {
                  return NextResponse.json(
                        {
                              error:
                                    "Completed interviews cannot be cancelled",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            if (interview.status === "REJECTED") {
                  return NextResponse.json(
                        {
                              error:
                                    "Rejected interviews cannot be cancelled",
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
                              id: params.id,
                        },
                        data: {
                              status: "CANCELLED",
                        },
                  });

            return NextResponse.json(updated);

      } catch (error) {

            console.error(error);

            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}