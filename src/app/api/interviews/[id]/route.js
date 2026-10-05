import { prisma } from "@/lib/prisma";

import {
      requireAuth,
} from "@/lib/auth";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

const publicUser = { select: { id: true, name: true, email: true } };

export async function GET(
      req,
      { params }
) {

      try {

            const user =
                  requireAuth(req);

            const { id } =
                  await params;

            const interview =
                  await prisma.interview.findUnique({
                        where: {
                              id,
                        },

                        include: {
                              user: publicUser,
                              mentor: publicUser,
                        },
                  });

            if (!interview) {

                  return errorResponse(
                        "Interview not found",
                        404
                  );
            }

            if (
                  interview.userId !==
                  user.id
            ) {

                  return errorResponse(
                        "Forbidden",
                        403
                  );
            }

            return successResponse(
                  interview
            );

      } catch (err) {

            console.error(
                  "INTERVIEW DETAILS ERROR:",
                  err
            );

            if (
                  err.message ===
                  "Unauthorized"
            ) {

                  return errorResponse(
                        "Unauthorized",
                        401
                  );
            }

            return errorResponse(
                  "Server error",
                  500
            );
      }
}