import { successResponse } from "@/lib/apiResponse";

export async function POST() {
      const response = successResponse({ message: "Logged out" });

      response.cookies.set({
            name: "token",
            value: "",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 0,
      });

      return response;
}