import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validations";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError, zodErrorResponse } from "@/lib/apiHelpers";

// GET /api/categories — active categories for everyone; add ?all=1 (admin) to
// also include inactive ones for the management page.
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);

  await connectDB();

  const { searchParams } = new URL(req.url);
  const wantAll = searchParams.get("all") === "1" && session.role === "admin";

  const filter = wantAll ? {} : { active: true };
  const categories = await Category.find(filter).sort({ name: 1 }).lean();
  return jsonOk({ categories });
}

// POST /api/categories — admin only: create a category.
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) return jsonError("Not authenticated", 401);
    if (session.role !== "admin") return jsonError("Admins only", 403);

    const body = await req.json();
    const data = categorySchema.parse(body);

    await connectDB();

    const existing = await Category.findOne({
      name: new RegExp(`^${escapeRegex(data.name)}$`, "i"),
    });
    if (existing) return jsonError("A category with this name already exists", 409);

    const category = await Category.create({
      name: data.name,
      description: data.description || undefined,
      sensitive: data.sensitive,
      active: data.active,
    });
    return jsonOk({ category }, 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    console.error("Create category error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
