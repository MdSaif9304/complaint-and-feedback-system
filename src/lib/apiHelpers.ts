import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Convert a ZodError into a flat field -> message map for the client. */
export function zodErrorResponse(err: ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const path = issue.path.join(".") || "form";
    if (!fieldErrors[path]) fieldErrors[path] = issue.message;
  }
  return NextResponse.json(
    { error: "Validation failed", fieldErrors },
    { status: 422 }
  );
}
