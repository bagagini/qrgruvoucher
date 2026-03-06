import {
  createHotel,
  deleteHotel,
  listHotels,
  updateHotel,
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
    const hotels = await listHotels(context.env);
    return json({ hotels });
  }

  if (context.request.method === "POST") {
    const body = await readJson(context.request);
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    if (!id || !name) {
      return badRequest("id and name are required");
    }

    const current = await listHotels(context.env);
    if (current.some((row) => row.id === id)) {
      return badRequest("hotel id already exists");
    }

    const hotel = await createHotel(context.env, { id, name });
    return json({ ok: true, hotel }, 201);
  }

  if (context.request.method === "PUT") {
    const body = await readJson(context.request);
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    if (!id || !name) {
      return badRequest("id and name are required");
    }

    const updated = await updateHotel(context.env, { id, name });
    if (!updated) {
      return badRequest("hotel not found");
    }

    return json({ ok: true });
  }

  if (context.request.method === "DELETE") {
    const url = new URL(context.request.url);
    const id = String(url.searchParams.get("id") || "").trim();
    if (!id) {
      return badRequest("id is required");
    }

    const removed = await deleteHotel(context.env, id);
    if (!removed) {
      return badRequest("hotel not found");
    }

    return json({ ok: true });
  }

  return methodNotAllowed();
}
