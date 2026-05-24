// import { cookies } from "next/headers";
// import jwt from "jsonwebtoken";
// import { requireRole } from "@/lib/auth";

// export async function requireAdmin() {
//       try {
//             const cookieStore = await cookies();
//             const token = cookieStore.get("token")?.value;

//             if (!token) {
//                   return { error: "Unauthorized", status: 401 };
//             }

//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             if (!["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
//                   return { error: "Forbidden", status: 403 };
//             }

//             return { user: decoded };
//       } catch (err) {
//             return { error: "Invalid token", status: 401 };
//       }
// }

import { requireRole } from "@/lib/auth";

export function requireAdmin(req) {
      return requireRole(req, ["ADMIN", "SUPER_ADMIN"]);
}