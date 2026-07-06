import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations";
import { signToken, AUTH_COOKIE } from "@/lib/auth";
import { jsonError, zodErrorResponse } from "@/lib/apiHelpers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    await connectDB();

    // password has select:false, so explicitly select it here.
    const user = await User.findOne({ email: data.email }).select("+password");
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      return jsonError("Invalid email or password", 401);
    }

    const token = await signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    const res = NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
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
    console.error("Login error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
