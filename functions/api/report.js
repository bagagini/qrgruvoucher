import { createReport } from "./_store.js";
import { json, methodNotAllowed, readJson, badRequest } from "./_utils.js";

export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return methodNotAllowed();
  }

  const body = await readJson(context.request);
  const staffNumber = String(body.staffNumber || "").trim();
  const message = String(body.message || "").trim();
  const category = String(body.category || "general").trim().toLowerCase();

  if (!staffNumber) {
    return badRequest("staffNumber is required");
  }

  if (!message) {
    return badRequest("message is required");
  }

  const report = await createReport(context.env, {
    staffNumber,
    message,
    category
  });

  return json({ ok: true, report }, 201);
}
