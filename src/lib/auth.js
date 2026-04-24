import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";


// ============================
// 🔐 PASSWORD UTILS
// ============================

// Hash password (signup)
export async function hashPassword(password) {
      return bcrypt.hash(password, 10);
}

// Compare password (login)
export async function comparePassword(password, hash) {
      return bcrypt.compare(password, hash);
}


// ============================
// 🔑 JWT AUTH UTILS
// ============================

// Get logged-in user from cookie
export function getUserFromToken() {
      try {
            const token = cookies().get("token")?.value;

            if (!token) return null;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            return decoded; // { id, role }
      } catch {
            return null;
      }
}


// ============================
// 🛡️ ADMIN PROTECTION
// ============================

export function requireAdmin() {
      const user = getUserFromToken();

      if (!user) {
            return { error: "Unauthorized", status: 401 };
      }

      if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
            return { error: "Forbidden", status: 403 };
      }

      return { user };
}