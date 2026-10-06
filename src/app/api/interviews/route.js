import { prisma } from "@/lib/prisma";

import {
      requireAuth,
} from "@/lib/auth";

import {
      successResponse,
      errorResponse,
} from "@/lib/apiResponse";

const publicUser = { select: { id: true, name: true, email: true } };

const HIDE_AFTER_DAYS = 7;

export async function GET(req) {

      try {

            const user =
                  requireAuth(req);

            const cutoff = new Date(Date.now() - HIDE_AFTER_DAYS * 24 * 60 * 60 * 1000);

            const interviews =
                  await prisma.interview.findMany({
                        where: {
                              userId: user.id,
                              NOT: {
                                    status: { in: ["CANCELLED", "REJECTED"] },
                                    updatedAt: { lt: cutoff },
                              },
                        },

                        include: {
                              mentor: publicUser,
                        },

                        orderBy: {
                              createdAt: "desc",
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