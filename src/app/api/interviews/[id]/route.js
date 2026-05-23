import { prisma } from "@/lib/prisma";

import {
      requireAuth,
} from "@/lib/auth";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

export async function GET(
      req,
      { params }
) {

      try {

            // AUTH

            const user =
                  requireAuth(req);

            // PARAMS

            const { id } =
                  await params;

            // INTERVIEW

            const interview =
                  await prisma.interview.findUnique({
                        where: {
                              id,
                        },

                        include: {
                              user: true,
                              mentor: true,
                        },
                  });

            // NOT FOUND

            if (!interview) {

                  return errorResponse(
                        "Interview not found",
                        404
                  );
            }

            // OWNERSHIP CHECK

            if (
                  interview.userId !==
                  user.id
            ) {

                  return errorResponse(
                        "Forbidden",
                        403
                  );
            }

            // SUCCESS

            return successResponse(
                  interview
            );

      } catch (err) {

            console.error(
                  "INTERVIEW DETAILS ERROR:",
                  err
            );

            // AUTH

            if (
                  err.message ===
                  "Unauthorized"
            ) {

                  return errorResponse(
                        "Unauthorized",
                        401
                  );
            }

            // SERVER

            return errorResponse(
                  "Server error",
                  500
            );
      }
}