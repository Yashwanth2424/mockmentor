import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/adminAuth";

export async function PATCH(req, { params }) {

      const auth = await requireAdmin();

      if (auth.error) {
            return NextResponse.json(
                  { error: auth.error },
                  { status: auth.status }
            );
      }

      try {
            // Get token
            const cookieStore = await cookies();
            const token = cookieStore.get("token")?.value;

            if (!token) {
                  return NextResponse.json(
                        { error: "Unauthorized" },
                        { status: 401 }
                  );
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            //  Only ADMIN or SUPER_ADMIN allowed
            if (!["ADMIN", "SUPER_ADMIN"].includes(decoded.role)) {
                  return NextResponse.json(
                        { error: "Forbidden" },
                        { status: 403 }
                  );
            }

            //  Get new role
            const { role } = await req.json();

            //  Update user
            const updated = await prisma.user.update({
                  where: { id: params.id },
                  data: { role },
            });

            return NextResponse.json(updated);

      } catch (error) {
            console.error(error);
            return NextResponse.json(
                  { error: "Failed to update role" },
                  { status: 500 }
            );
      }
}