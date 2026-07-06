import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import Feedback from "@/models/Feedback";
import { feedbackSchema } from "@/lib/validations";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/apiHelpers";

// GET /api/feedback — admins see all feedback (anonymous ones hide the user).
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);

    await connectDB();

    if (session.role === "admin") {
      const feedback = await Feedback.find()
        .populate("user", "name email role")
        .sort({ createdAt: -1 })
        .lean();
      // Strip user info from anonymous submissions before sending to client.
      const sanitized = feedback.map((f) =>
        f.anonymous ? { ...f, user: undefined } : f
      );
      return jsonOk({ feedback: sanitized });
    }

    const feedback = await Feedback.find({ user: session.userId })
      .sort({ createdAt: -1 })
      .lean();
    return jsonOk({ feedback });
  } catch (err) {
    console.error("List feedback error:", err);
    return jsonError("Could not load feedback. Please try again.", 500);
  }
}

// POST /api/feedback — students & faculty submit feedback (optionally anonymous).
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);

    const body = await req.json();
    const data = feedbackSchema.parse(body);

    await connectDB();

    const feedback = await Feedback.create({
      category: data.category,
      rating: data.rating,
      comments: data.comments || undefined,
      anonymous: data.anonymous,
      // Only link the user when the submission is not anonymous.
      user: data.anonymous ? undefined : session.userId,
    });

    return jsonOk({ feedback }, 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Create feedback error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
