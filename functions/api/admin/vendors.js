import {
  createVendor,
  deleteVendor,
  listVendors,
  updateVendor,
  validateSupervisorSession
} from "../_store.js";
import {
  badRequest,
  getSupervisorToken,
  json,
  methodNotAllowed,
  readJson,
  unauthorized
} from "../_utils.js";

export async function onRequest(context) {
  const token = getSupervisorToken(context.request);
  const allowed = await validateSupervisorSession(context.env, token);
  if (!allowed) {
    return unauthorized("Supervisor token is missing or expired");
  }

  if (context.request.method === "GET") {
    const vendors = await listVendors(context.env);
    return json({ vendors });
  }

  if (context.request.method === "POST") {
    const body = await readJson(context.request);
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    if (!id || !name) {
      return badRequest("id and name are required");
    }

    const current = await listVendors(context.env);
    if (current.some((row) => row.id === id)) {
      return badRequest("vendor id already exists");
    }

    const vendor = await createVendor(context.env, { id, name });
    return json({ ok: true, vendor }, 201);
  }

  if (context.request.method === "PUT") {
    const body = await readJson(context.request);
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    if (!id || !name) {
      return badRequest("id and name are required");
    }

    const updated = await updateVendor(context.env, { id, name });
    if (!updated) {
      return badRequest("vendor not found");
    }

    return json({ ok: true });
  }

  if (context.request.method === "DELETE") {
    const url = new URL(context.request.url);
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) {
      return badRequest("id is required");
    }

    const removed = await deleteVendor(context.env, id);
    if (!removed) {
      return badRequest("vendor not found");
    }

    return json({ ok: true });
  }

  return methodNotAllowed();
}
