import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

const publicUser = { select: { id: true, name: true, email: true } };

export async function GET(req, { params }) {
  try {
    await requireAdmin(req);
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.message === "Forbidden" ? 403 : 401 },
    );
  }

  try {
    const { id } = await params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: { user: publicUser, mentor: publicUser },
    });

    if (!interview) {
      return NextResponse.json({ success: false, error: "Interview not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: interview });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
