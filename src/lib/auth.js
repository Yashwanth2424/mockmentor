import bcrypt from "bcryptjs";

import { verifyToken } from "@/lib/jwt";

/* PASSWORD HELPERS */

export async function hashPassword(
      password
) {

      return bcrypt.hash(
            password,
            10
      );
}

export async function comparePassword(
      password,
      hashedPassword
) {

      return bcrypt.compare(
            password,
            hashedPassword
      );
}

/* GET TOKEN */

export function getToken(req) {

      return req.cookies.get("token")
            ?.value;
}

/* GET CURRENT USER */

export function getCurrentUser(req) {

      try {

            const token =
                  getToken(req);

            if (!token) {
                  return null;
            }

            return verifyToken(
                  token
            );

      } catch {

            return null;
      }
}

/* REQUIRE AUTH */

export function requireAuth(req) {

      const user =
            getCurrentUser(req);

      if (!user) {

            throw new Error(
                  "Unauthorized"
            );
      }

      return user;
}

/* REQUIRE ROLE */

export function requireRole(
      req,
      allowedRoles = []
) {

      const user =
            requireAuth(req);

      if (
            !allowedRoles.includes(
                  user.role
            )
      ) {

            throw new Error(
                  "Forbidden"
            );
      }

      return user;
}