import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {

      try {

            const mentors =
                  await prisma.user.findMany({
                        where: {
                              role: "MENTOR",
                        },

                        select: {
                              id: true,
                              name: true,
                              email: true,

                              availability: true,
                        },
                  });

            console.log(
                  "MENTORS API HIT"
            );

            return NextResponse.json(
                  mentors
            );

      } catch (error) {

            console.error(error);

            return NextResponse.json(
                  {
                        error:
                              "Failed to fetch mentors",
                  },
                  {
                        status: 500,
                  }
            );
      }
}