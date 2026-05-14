import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
      comparePassword,
} from "@/lib/auth";

import {
      createToken,
} from "@/lib/jwt";

export async function POST(req) {

      try {

            const {
                  email,
                  password,
            } = await req.json();

            //  VALIDATION 

            if (
                  !email?.trim() ||
                  !password?.trim()
            ) {
                  return NextResponse.json(
                        {
                              error:
                                    "Email and password are required",
                        },
                        {
                              status: 400,
                        }
                  );
            }

            //  FIND USER 

            const user =
                  await prisma.user.findUnique({
                        where: {
                              email:
                                    email.trim(),
                        },
                  });

            if (!user) {
                  return NextResponse.json(
                        {
                              error:
                                    "Invalid email or password",
                        },
                        {
                              status: 401,
                        }
                  );
            }

            //  PASSWORD 

            const isValid =
                  await comparePassword(
                        password,
                        user.password
                  );

            if (!isValid) {
                  return NextResponse.json(
                        {
                              error:
                                    "Invalid email or password",
                        },
                        {
                              status: 401,
                        }
                  );
            }

            //  TOKEN 

            const token =
                  createToken({
                        id: user.id,
                        role: user.role,
                  });

            //  RESPONSE 

            const response =
                  NextResponse.json({
                        message:
                              "Login successful",
                        role: user.role,
                  });

            //  COOKIE 

            response.cookies.set({
                  name: "token",
                  value: token,

                  httpOnly: true,

                  secure:
                        process.env.NODE_ENV ===
                        "production",

                  sameSite: "lax",

                  path: "/",

                  maxAge:
                        60 * 60 * 24 * 7,
            });

            return response;

      } catch (error) {

            console.error(
                  "LOGIN ERROR:",
                  error
            );

            return NextResponse.json(
                  { error: "Server error" },
                  { status: 500 }
            );
      }
}