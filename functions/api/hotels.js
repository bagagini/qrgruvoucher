import { requireSession } from "./_auth.js";
import { listHotels, upsertHotel } from "./_db.js";
import { badRequest, json, methodNotAllowed, readJson } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method === "GET") {
    const auth = await requireSession(context, ["AGENT", "SUPERVISOR"]);
    if (!auth.ok) return auth.response;
    const hotels = await listHotels(context.env);
    return json({ hotels });
  }

  if (["POST", "PUT"].includes(context.request.method)) {
    const auth = await requireSession(context, ["SUPERVISOR"]);
    if (!auth.ok) return auth.response;

    const body = await readJson(context.request);
    if (!body.hotel_code || !body.hotel_name) {
      return badRequest("hotel_code and hotel_name are required");
    }

    const hotel = await upsertHotel(context.env, body);
    return json({ ok: true, hotel });
  }

  return methodNotAllowed();
}
