import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function PATCH(req) {
      try {
            const token = req.cookies.get("token")?.value;

            if (!token) {
                  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const decoded = verifyToken(token);

            const { availability } = await req.json();

            if (!Array.isArray(availability)) {
                  return NextResponse.json({ error: "Invalid data" }, { status: 400 });
            }

            // if (a.startHour >= a.endHour) {
            //       throw new Error("Invalid time range");
            // }

            // 🔥 Transaction to avoid partial updates
            await prisma.$transaction([
                  // 1. Delete old availability
                  prisma.mentorAvailability.deleteMany({
                        where: { mentorId: decoded.id },
                  }),

                  // 2. Create new availability
                  prisma.mentorAvailability.createMany({
                        data: availability.map((a) => ({
                              mentorId: decoded.id,
                              dayOfWeek: a.dayOfWeek,
                              startHour: parseInt(a.startHour),
                              endHour: parseInt(a.endHour),
                        })),
                  }),
            ]);

            return NextResponse.json({ message: "Availability updated" });

      } catch (err) {
            console.error(err);
            return NextResponse.json({ error: "Failed" }, { status: 500 });
      }
}