import { NextResponse } from "next/server";

export async function POST() {

      const response = NextResponse.json({
            message: "Logged out",
      });

      // Delete the cookie
      response.cookies.set("token", "", {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 0,
      });

      return response;
}