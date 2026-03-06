import { listLatestVouchers } from "./_store.js";
import { json, methodNotAllowed } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const url = new URL(context.request.url);
  const limit = Number(url.searchParams.get("limit") || 20);
  const vouchers = await listLatestVouchers(context.env, limit);
  return json({ vouchers });
}
