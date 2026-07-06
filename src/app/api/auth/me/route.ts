import { NextRequest } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";
import { jsonOk, jsonError } from "@/lib/apiHelpers";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return jsonError("Not authenticated", 401);
  return jsonOk({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
  });
}
