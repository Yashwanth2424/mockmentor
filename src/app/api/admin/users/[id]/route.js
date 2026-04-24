import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function DELETE(req, context) {
      try {
            const { id } = await context.params;

            const cookieStore = await cookies();
            const token = cookieStore.get("token")?.value;

            if (!token) {
                  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }

            const decoded = jwt.verify(token, "secretkey");

            if (decoded.role !== "ADMIN") {
                  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            // Prevent deleting yourself
            if (decoded.id === id) {
                  return NextResponse.json(
                        { error: "You cannot delete your own account" },
                        { status: 400 }
                  );
            }

            await prisma.user.delete({
                  where: { id },
            });

            return NextResponse.json({ message: "User deleted" });

      } catch (error) {
            console.error(error);
            return NextResponse.json(
                  { error: "Delete failed" },
                  { status: 500 }
            );
      }
}