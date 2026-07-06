import { NextRequest } from "next/server";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Complaint from "@/models/Complaint";
import { updateComplaintSchema } from "@/lib/validations";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/apiHelpers";
import { STATUS_LABELS } from "@/lib/constants";

async function findComplaint(id: string) {
  // Allow lookup by Mongo _id or by human ticketId (e.g. CMP-XXXXX).
  const query = mongoose.isValidObjectId(id)
    ? { $or: [{ _id: id }, { ticketId: id }] }
    : { ticketId: id };
  return Complaint.findOne(query).populate("user", "name email role department");
}

// GET /api/complaints/:id — owner or admin.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);

  await connectDB();
  const { id } = await params;
  const complaint = await findComplaint(id);
  if (!complaint) return jsonError("Complaint not found", 404);

  const ownerId = (complaint.user as { _id: mongoose.Types.ObjectId })._id.toString();
  if (session.role !== "admin" && ownerId !== session.userId) {
    return jsonError("You do not have access to this complaint", 403);
  }

  return jsonOk({ complaint });
}

// PATCH /api/complaints/:id — admin only: update status/priority/assignment.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);
    if (session.role !== "admin") {
      return jsonError("Only administrators can update complaints", 403);
    }

    const body = await req.json();
    const data = updateComplaintSchema.parse(body);

    await connectDB();
    const { id } = await params;
    const complaint = await findComplaint(id);
    if (!complaint) return jsonError("Complaint not found", 404);

    if (data.priority) complaint.priority = data.priority;
    if (data.assignedTo !== undefined) complaint.assignedTo = data.assignedTo;

    if (data.status && data.status !== complaint.status) {
      complaint.status = data.status;
    }

    // Record an audit entry whenever status changes or a response is added.
    if (data.status || data.response) {
      complaint.updates.push({
        status: data.status || complaint.status,
        note:
          data.response ||
          (data.status ? `Status changed to ${STATUS_LABELS[data.status]}` : ""),
        by: session.name,
        at: new Date(),
      });
    }

    await complaint.save();
    return jsonOk({ complaint });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Update complaint error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
