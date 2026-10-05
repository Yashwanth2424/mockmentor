import { prisma } from "@/lib/prisma";

import {
      requireAuth,
} from "@/lib/auth";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

const publicUser = { select: { id: true, name: true, email: true } };

export async function GET(req) {

      try {

            const user =
                  requireAuth(req);

            const interviews =
                  await prisma.interview.findMany({
                        where: {
                              userId: user.id,
                        },

                        include: {
                              mentor: publicUser,
                        },

                        orderBy: {
                              date: "asc",
                        },
                  });

            return successResponse(
                  interviews
            );

      } catch (err) {

            console.error(
                  "INTERVIEWS ERROR:",
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