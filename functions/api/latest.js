import { requireSession } from "./_auth.js";
import { latestVouchers } from "./_db.js";
import { json, methodNotAllowed } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const url = new URL(context.request.url);
  const limit = Number(url.searchParams.get("limit") || 30);
  const vouchers = await latestVouchers(context.env, limit);
  return json({ vouchers });
}
