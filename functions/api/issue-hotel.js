import { requireSession } from "./_auth.js";
import { issueHotelBatch, listHotels } from "./_db.js";
import { badRequest, json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
  if (!auth.ok) return auth.response;

  const body = await readJson(context.request);
  const quantity = Number(body.quantity || 0);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 200) {
    return badRequest("quantity must be integer between 1 and 200");
  }

  const hotels = await listHotels(context.env);
  const hotel = hotels.find((x) => x.hotel_code === String(body.hotel_code || "").trim().toUpperCase());
  if (!hotel) {
    return badRequest("Invalid hotel_code");
  }

  const flight = String(body.flight || "").trim().toUpperCase();
  const reason = String(body.reason || "").trim();
  if (!flight || !reason) {
    return badRequest("flight and reason are required");
  }

  const result = await issueHotelBatch(context.env, {
    hotel,
    quantity,
    flight,
    reason,
    staff_number: auth.session.actor_id
  });

  return json({ ok: true, ...result });
}
