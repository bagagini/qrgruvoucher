import { requireSession } from "./_auth.js";
import { listVendors, upsertVendor } from "./_db.js";
import { badRequest, json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "GET") {
    const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
    if (!auth.ok) return auth.response;
    const vendors = await listVendors(context.env);
    return json({ vendors });
  }

  if (["POST", "PUT"].includes(context.request.method)) {
    const auth = await requireSession(context, ["SUPERVISOR"]);
    if (!auth.ok) return auth.response;

    const body = await readJson(context.request);
    if (!body.vendor_code || !body.vendor_name) {
      return badRequest("vendor_code and vendor_name are required");
    }

    const vendor = await upsertVendor(context.env, body);
    return json({ ok: true, vendor });
  }

  return methodNotAllowed();
}
