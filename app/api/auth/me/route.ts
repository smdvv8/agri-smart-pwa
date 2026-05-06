import { toErrorResponse } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { publicUser } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({ user: publicUser(user) });
  } catch (error) {
    return toErrorResponse(error);
  }
}
