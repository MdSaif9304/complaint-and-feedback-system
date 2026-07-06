import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import Category from "@/models/Category";
import { complaintSchema } from "@/lib/validations";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/apiHelpers";

// GET /api/complaints — admins get all complaints; others get their own.
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  const filter: Record<string, unknown> = {};
  if (session.role !== "admin") {
    filter.user = session.userId;
  }
  if (status) filter.status = status;
  if (category) filter.category = category;

  const complaints = await Complaint.find(filter)
    .populate("user", "name email role department")
    .sort({ createdAt: -1 })
    .lean();

  return jsonOk({ complaints });
}

// POST /api/complaints — students & faculty submit complaints.
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);
    if (session.role === "admin") {
      return jsonError("Admins cannot submit complaints", 403);
    }

    const body = await req.json();
    const data = complaintSchema.parse(body);

    await connectDB();

    // Ensure the chosen category exists and is currently active.
    const category = await Category.findOne({ name: data.category, active: true });
    if (!category) {
      return jsonError("Selected category is invalid or no longer available", 422);
    }

    const complaint = await Complaint.create({
      ...data,
      user: session.userId,
      updates: [
        {
          status: "pending",
          note: "Complaint submitted",
          by: session.name,
          at: new Date(),
        },
      ],
    });

    return jsonOk({ complaint }, 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Create complaint error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
