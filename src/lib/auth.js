import bcrypt from "bcryptjs";

import { cookies } from "next/headers";

import { verifyToken }
      from "@/lib/jwt";

export async function hashPassword(password) {

      return bcrypt.hash(
            password,
            10
      );
}


export async function comparePassword(
      password,
      hash
) {

      return bcrypt.compare(
            password,
            hash
      );
}


export async function getUserFromToken() {

      try {

            const cookieStore =
                  await cookies();

            const token =
                  cookieStore.get("token")?.value;

            if (!token) {
                  return null;
            }

            return verifyToken(token);

      } catch {

            return null;
      }
}


export async function requireAdmin() {

      const user =
            await getUserFromToken();

      if (!user) {

            return {
                  error: "Unauthorized",
                  status: 401,
            };
      }

      if (
            ![
                  "ADMIN",
                  "SUPER_ADMIN",
            ].includes(user.role)
      ) {

            return {
                  error: "Forbidden",
                  status: 403,
            };
      }

      return { user };
}