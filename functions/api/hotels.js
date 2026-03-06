import { listHotels } from "./_store.js";
import { json, methodNotAllowed } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const hotels = await listHotels(context.env);
  return json({ hotels });
}
