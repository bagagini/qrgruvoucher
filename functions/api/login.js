import { json, methodNotAllowed, readJson, badRequest } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const staffNumber = String(body.staffNumber || "").trim();

  if (!staffNumber) {
    return badRequest("staffNumber is required");
  }

  return json({ ok: true, staffNumber, name: `Staff ${staffNumber}` });
}
