import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(req, { params }) {
      try {
            requireAuth(req);

            const { id } = await params;

            const interviews = await prisma.interview.findMany({
                  where: {
                        mentorId: id,
                        status: { in: ["PENDING", "ACCEPTED"] },
                        date: { gte: new Date() },
                  },
                  select: { date: true },
            });

            return successResponse(interviews.map((i) => i.date));

      } catch (err) {
            if (err.message === "Unauthorized") return errorResponse("Unauthorized", 401);

            console.error("BOOKED SLOTS ERROR:", err);
            return errorResponse("Failed to load booked slots", 500);
      }
}
