import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req, context) {
      try {
            const { id } = await context.params;

            console.log("BACKEND ID:", id);

            if (!id) {
                  return NextResponse.json(
                        { error: "Missing ID" },
                        { status: 400 }
                  );
            }

            const updated = await prisma.interview.update({
                  where: { id },
                  data: {
                        status: "ACCEPTED",
                  },
            });

            return NextResponse.json(updated);
      } catch (err) {
            console.error("ACCEPT ERROR:", err);
            return NextResponse.json(
                  { error: "Failed to accept" },
                  { status: 500 }
            );
      }
}