import { listVendors } from "./_store.js";
import { json, methodNotAllowed } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "GET") {
    return methodNotAllowed();
  }

  const vendors = await listVendors(context.env);
  return json({ vendors });
}
