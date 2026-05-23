import { prisma } from "@/lib/prisma";

import {
      requireAuth,
} from "@/lib/auth";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

export async function GET(req) {

      try {

            // AUTH

            const user =
                  requireAuth(req);

            // INTERVIEWS

            const interviews =
                  await prisma.interview.findMany({
                        where: {
                              userId: user.id,
                        },

                        include: {
                              mentor: true,
                        },

                        orderBy: {
                              date: "asc",
                        },
                  });

            // SUCCESS

            return successResponse(
                  interviews
            );

      } catch (err) {

            console.error(
                  "INTERVIEWS ERROR:",
                  err
            );

            // AUTH ERRORS

            if (
                  err.message ===
                  "Unauthorized"
            ) {

                  return errorResponse(
                        "Unauthorized",
                        401
                  );
            }

            // SERVER ERROR

            return errorResponse(
                  "Server error",
                  500
            );
      }
}