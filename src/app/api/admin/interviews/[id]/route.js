import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";

// GET — Fetch interview
export async function GET(req, { params }) {

      try {
            requireAdmin(req);
      } catch (err) {
            return NextResponse.json(
                  { success: false, error: err.message },
                  { status: err.message === "Forbidden" ? 403 : 401 }
            );
      }

      try {
            const { id } = await params;

            const interview = await prisma.interview.findUnique({
                  where: { id },
                  include: { user: true },
            });

            if (!interview) {
                  return NextResponse.json(
                        { success: false, error: "Interview not found" },
                        { status: 404 }
                  );
            }

            return NextResponse.json({ success: true, data: interview });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Server error" },
                  { status: 500 }
            );
      }
}

// PATCH — Update interview
export async function PATCH(req, { params }) {

      try {
            requireAdmin(req);
      } catch (err) {
            return NextResponse.json(
                  { success: false, error: err.message },
                  { status: err.message === "Forbidden" ? 403 : 401 }
            );
      }

      try {
            const { id } = await params;
            const body = await req.json();
            const { status, date, feedback } = body;

            const updated = await prisma.interview.update({
                  where: { id },
                  data: {
                        ...(status && { status }),
                        ...(date && { date: new Date(date) }),
                        ...(feedback !== undefined && { feedback }),
                  },
            });

            return NextResponse.json({ success: true, data: updated });

      } catch (err) {
            return NextResponse.json(
                  { success: false, error: "Update failed" },
                  { status: 500 }
            );
      }
}