import { requireRole } from "@/lib/auth";

export function requireAdmin(req) {
      return requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
}