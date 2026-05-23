import { NextResponse } from "next/server";

/* SUCCESS RESPONSE  */

export function successResponse(
      data = null,
      status = 200
) {

      return NextResponse.json(
            {
                  success: true,
                  data,
            },
            { status }
      );
}

/* ERROR RESPONSE */

export function errorResponse(
      message = "Something went wrong",
      status = 500
) {

      return NextResponse.json(
            {
                  success: false,
                  error: message,
            },
            { status }
      );
}