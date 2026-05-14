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



            //  Transaction to avoid partial updates
            await prisma.$transaction([
                  prisma.mentorAvailability.deleteMany({
                        where: { mentorId: decoded.id },
                  }),

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