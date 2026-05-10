import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
      try {
            const { id } = await context.params;

            if (!id) {
                  return NextResponse.json({ error: "Missing ID" }, { status: 400 });
            }

            const updated = await prisma.interview.update({
                  where: { id },
                  data: {
                        status: "REJECTED",
                  },
            });

            return NextResponse.json(updated);
      } catch (err) {
            console.error("REJECT ERROR:", err);
            return NextResponse.json(
                  { error: "Failed to reject" },
                  { status: 500 }
            );
      }
}