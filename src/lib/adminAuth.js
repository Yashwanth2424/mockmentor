import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export async function requireAdmin(req) {
  const tokenUser = requireAuth(req);

  const user = await prisma.user.findUnique({
    where: { id: tokenUser.id },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!ADMIN_ROLES.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
