import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { jsonError, zodErrorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role,
      department: data.department,
      rollNo: data.rollNo || undefined,
    });

    const token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
    res.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Register error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
