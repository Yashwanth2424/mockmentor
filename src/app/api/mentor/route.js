import { prisma } from "@/lib/prisma";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

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

                              availability: {
                                    select: {
                                          id: true,
                                          dayOfWeek: true,
                                          startHour: true,
                                          endHour: true,
                                    },
                              },
                        },
                  });

            return successResponse(
                  mentors
            );

      } catch (err) {

            console.error(
                  "MENTOR FETCH ERROR:",
                  err
            );

            return errorResponse(
                  "Failed to fetch mentors",
                  500
            );
      }
}