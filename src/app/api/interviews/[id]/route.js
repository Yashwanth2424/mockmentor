import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function GET(req, { params }) {
      try {
            //  Get token
            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            //  Decode token
            const decoded = verifyToken(token);

            //  IMPORTANT (Next.js fix)
            const { id } = await params;

            //  Get interview
            const interview = await prisma.interview.findUnique({
                  where: { id },
            });

            if (!interview) {
                  return NextResponse.json(
                        { error: "Interview not found" },
                        { status: 404 }
                  );
            }

            //  SECURITY CHECK
            if (interview.userId !== decoded.id) {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            return NextResponse.json(interview);

      } catch (err) {
            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}