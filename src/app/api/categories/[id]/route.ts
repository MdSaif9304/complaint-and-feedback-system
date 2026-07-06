import { NextRequest } from "next/server";
import { ZodError } from "zod";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Complaint from "@/models/Complaint";
import { updateCategorySchema } from "@/lib/validations";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/apiHelpers";

// PATCH /api/categories/:id — admin only: rename, edit, or toggle active/sensitive.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);
    if (session.role !== "admin") return jsonError("Admins only", 403);

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return jsonError("Invalid category id", 400);

    const body = await req.json();
    const data = updateCategorySchema.parse(body);

    await connectDB();
    const category = await Category.findById(id);
    if (!category) return jsonError("Category not found", 404);

    // If renaming, keep existing complaints pointing at the new name.
    if (data.name && data.name !== category.name) {
      const dupe = await Category.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${data.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });
      if (dupe) return jsonError("A category with this name already exists", 409);

      await Complaint.updateMany(
        { category: category.name },
        { $set: { category: data.name } }
      );
      category.name = data.name;
    }

    if (data.description !== undefined) category.description = data.description || undefined;
    if (data.sensitive !== undefined) category.sensitive = data.sensitive;
    if (data.active !== undefined) category.active = data.active;

    await category.save();
    return jsonOk({ category });
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Update category error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}

// DELETE /api/categories/:id — admin only. Blocked if complaints still use it
// (suggest deactivating instead, so historical data stays intact).
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);
  if (session.role !== "admin") return jsonError("Admins only", 403);

  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid category id", 400);

  await connectDB();
  const category = await Category.findById(id);
  if (!category) return jsonError("Category not found", 404);

  const inUse = await Complaint.countDocuments({ category: category.name });
  if (inUse > 0) {
    return jsonError(
      `Cannot delete: ${inUse} complaint(s) use this category. Deactivate it instead.`,
      409
    );
  }

  await category.deleteOne();
  return jsonOk({ ok: true });
}
