import { createSupervisorSession } from "./_store.js";
import { json, methodNotAllowed, readJson, badRequest, unauthorized } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const staffNumber = String(body.staffNumber || "").trim();
  const pin = String(body.pin || "").trim();
  const expectedPin = String(context.env.SUPERVISOR_PIN || "2468").trim();

  if (!staffNumber) {
    return badRequest("staffNumber is required");
  }

  if (!pin) {
    return badRequest("pin is required");
  }

  if (pin !== expectedPin) {
    return unauthorized("Invalid supervisor credentials");
  }

  const session = await createSupervisorSession(context.env, staffNumber);
  return json({ ok: true, token: session.token, expiresAt: session.expiresAt });
}
