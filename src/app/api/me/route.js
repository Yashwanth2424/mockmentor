import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/apiResponse";

export async function GET(req) {
      try {
            const authUser = requireAuth(req);

            const user = await prisma.user.findUnique({
                  where: { id: authUser.id },
                  select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                  },
            });

            if (!user) {
                  return errorResponse("User not found", 404);
            }

            return successResponse(user);

      } catch (err) {
            if (err.message === "Unauthorized") {
                  return errorResponse("Unauthorized", 401);
            }

            return errorResponse("Server error", 500);
      }
}